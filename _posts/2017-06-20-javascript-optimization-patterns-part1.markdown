---
layout: post
title: JavaScript Optimization Patterns (Part 1)
---

It's been a while since my last blog post, mostly because I didn't really have the time or the energy to sit down and write up all the stuff that I wanted to write about. Part of it was because I have been pretty busy with the [Ignition and TurboFan launch](https://v8project.blogspot.com/2017/05/launching-ignition-and-turbofan.html) in Chrome 59, which fortunately was a huge success thus far. But also partly because I took some time off with my family. And last but not least I went to [JSConf EU](https://2017.jsconf.eu) and [Web Rebels](https://www.webrebels.org), and at the time of this writing I'm at [enterJS](https://www.enterjs.de/), procastinating on doing the final tweaking for my talk.

Meanwhile I just got back from a very interesting dinner discussion with [Brian Terlson](https://twitter.com/bterlson), [Ada Rose Edwards](https://twitter.com/Lady_Ada_King) and [Ashely Williams](https://twitter.com/ag_dubs) about *good optimization patterns* for JavaScript that we can give as advice safely, and in particular how hard it is to come up with those. One particular point that I made was that ideal performance often depends on the context in which the code is running, and that's oftentimes the most difficult part. So I thought it's probably worth sharing this information with everyone. I'll start this as a series of blog posts. In this first part I'll try to highlight the impact that the concrete execution context can have on the performance of your JavaScript code.

Consider the following artificial `Point` class, which has a method `distance` that computes the [Manhatten distance](https://en.wiktionary.org/wiki/Manhattan_distance) of two such points.

{% highlight javascript %}
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distance(other) {
    const dx = Math.abs(this.x - other.x);
    const dy = Math.abs(this.y - other.y);
    return dx + dy;
  }
}
{% endhighlight %}

In addition to that consider the following `test` driver function, which creates a couple of `Point` instances, and computes the `distance` between them several million times, summing up the result (yeah I know it's a micro-benchmark, but bear with me for a second):

{% highlight javascript %}
function test() {
  const points = [
    new Point(10, 10),
    new Point(1, 1),
    new Point(8, 9)
  ];
  let result = 0;
  for (let i = 0; i < 10000000; ++i) {
    for (const point1 of points) {
      for (const point2 of points) {
        result += point1.distance(point2);
      }
    }
  }
  return result;
}
{% endhighlight %}

Now we have a proper benchmarkfor the `Point` class and in particular its `distance` method. Let's do a couple of runs of the `test` driver to see what the performance is, using the following HTML snippet:

{% highlight html %}
<script>
    function test() {
        class Point {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }

            distance(other) {
                const dx = Math.abs(this.x - other.x);
                const dy = Math.abs(this.y - other.y);
                return dx + dy;
            }
        }

        const points = [
            new Point(10, 10),
            new Point(1, 1),
            new Point(8, 9)
        ];
        let result = 0;
        for (let i = 0; i < 10000000; ++i) {
            for (const point1 of points) {
                for (const point2 of points) {
                    result += point1.distance(point2);
                }
            }
        }
        return result;
    }

    for (let i = 1; i <= 5; ++i) {
        console.time("test " + i);
        test();
        console.timeEnd("test " + i);
    }
</script>
{% endhighlight %}

If you run this in Chrome 61 (canary), you'll see the following output in the Chrome Developer Tools Console:

```
test 1: 595.248046875ms
test 2: 765.451904296875ms
test 3: 930.452880859375ms
test 4: 994.2890625ms
test 5: 3894.27392578125ms
```

The performance of the individual runs is very inconsistent. You can see that the performance get's worse with each subsequent run. The reason for the performance regression is that the `Point` class sits inside the `test` function.

{% highlight html %}
<script>
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        distance(other) {
            const dx = Math.abs(this.x - other.x);
            const dy = Math.abs(this.y - other.y);
            return dx + dy;
        }
    }

    function test() {
        const points = [
            new Point(10, 10),
            new Point(1, 1),
            new Point(8, 9)
        ];
        let result = 0;
        for (let i = 0; i < 10000000; ++i) {
            for (const point1 of points) {
                for (const point2 of points) {
                    result += point1.distance(point2);
                }
            }
        }
        return result;
    }

    for (let i = 1; i <= 5; ++i) {
        console.time("test " + i);
        test();
        console.timeEnd("test " + i);
    }
</script>
{% endhighlight %}

If we change the snippet slightly such that the `Point` class is defined outside of the `test` function, we'll get different results:

```
test 1: 598.794921875ms
test 2: 599.18115234375ms
test 3: 600.410888671875ms
test 4: 608.98388671875ms
test 5: 605.36376953125ms
```

The performance is pretty much stable now with the usual noise. Notice that in both cases, we used exactly the same code for the `Point` class and exactly the same code for the `test` driver logic. The only difference is where exactly we place the `Point` class in the code.

<p><center>
  <img src="/images/2017/class-20170620.png" alt="Global vs. local class" />
</center></p>

It's also worth noting that this has nothing to do with the new ES2015 `class` syntax; using old style ES5 syntax for the `Point` class yields the same performance results:

{% highlight javascript %}
function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.distance = function (other) {
  var dx = Math.abs(this.x - other.x);
  var dy = Math.abs(this.y - other.y);
  return dx + dy;
}
{% endhighlight %}

The underlying reason for the performance difference when the `Point` class lives inside the `test` function is that the `class` literal is then executed multiple times (exactly 5 times in my example above), whereas if it lives outside the `test` function, it's only executed once. Everytime the `class` definition is executed, a new prototype object is created, which carries all the methods of the class. In addition to that a new *constructor* function is created, which corresponds to the `class`, and has the prototype object set as it's `"prototype"` property.

<p><center>
  <img src="/images/2017/devtools-20170620.png" alt="Global vs. local class" />
</center></p>

New instances of the class are created using this `"prototype"` as their prototype object. But since V8 tracks the prototype of an instance as part of the *object shape* or *hidden class* (see [Setting up prototypes in V8](https://medium.com/@tverwaes/setting-up-prototypes-in-v8-ec9c9491dfe2) for some details on this) in order to optimize access to properties on the prototype chain, having different prototypes automatically implies having different object shapes. And as such the generated code get's ever more polymorphic if the `class` definition is executed multiple times, and eventually V8 gives up on polymorphism after it has seen more than 4 different object shapes, and enters the so-called *megamorphic* state, which means it kind of gives up on generating highly optimized code.

So takeaway from this exercise: Identical code put into a slightly different place can easily lead to a **6.5x** difference in performance! This is especially important since popular benchmarking frameworks and sites like [esbench.com](https://esbench.com) tend to execute code in a different context than your application (i.e. wrap code in functions under the hood that are run multiple times) and thus the results from benchmarking that way can be highly misleading.
