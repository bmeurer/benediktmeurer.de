---
layout: post
title: Impact of polymorphism on component-based frameworks like React
---

I just realized that this is going to be the very first blog post of 2018 that I write myself - versus bugging
someone else to write a blog post. It's been quite a busy year for me already, plus I was sick a lot, and so
was my family. Anyways, here's something I've been meaning to send out for a while. And while the title mentions
[React](https://reactjs.org/) explicitly, this is by no means limited to React, but probably affects a lot of
code out there, including a lot of [Node.js](https://nodejs.org) code bases, where this impact is even more severe.

I've written a blog post on [Surprising polymorphism in React
applications](https://medium.com/@bmeurer/surprising-polymorphism-in-react-applications-63015b50abc) earlier
and this post goes in the same direction, although we'll explore a slightly different problem here. For more
background on the topic you may want to read [What's up with
monomorphism?](https://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html) and [Explaining JavaScript
VMs in JavaScript - Inline Caches](https://mrale.ph/blog/2012/06/03/explaining-js-vms-in-js-inline-caches.html)
by my colleague [Vyacheslav Egorov](https://twitter.com/mraleph).


## A motivating example

So let's dive right in with a code example. Imagine you have a component-based framework like React and
you need to call certain methods on all components, like the `render` method in case of React. Here's a
simplified example of how this could look like:

```js
// Base class for all components.
class Component {
  render() { return ''; }
}

class HelloComponent extends Component {
  render() {
    return '<div>Hello</div>';
  }
}

class LinkComponent extends Component {
  constructor(target, text) {
    this.target = target;
    this.text = text;
  }

  render() {
    return '<a href="' + this.target + '">' + this.text + '</a>';
  }
}

class DOM {
  static renderAll(target, components) {
    let html = '';
    for (const component of components) {
      html += component.render();
    }
    target.innerHTML = html;
  }
}

const components = [
  new HelloComponent(),
  new LinkComponent('http://www.google.com', 'Search')
];
DOM.renderAll(document.getElementById('my-app'), components);
```

You call `DOM.renderAll` to render a collection of components to a part of the DOM. This is oversimplified
of course, but you get the concept. Also note that this code doesn't follow any of the security advises for dealing
with HTML/DOM from JavaScript, so please don't take any inspiration here.

The interesting code here is inside of `DOM.renderAll`, where we access the property `component.render` of different
`component` shapes (in V8 speak we don't say *shape* but we use the term *map* or sometimes *hidden class*).
In this simple example we only have two different shapes of `component`: Either an instance of
`HelloComponent` where `render` is found on the `HelloComponent.prototype`, or an instance of `LinkComponent` where
`render` is found on the `LinkComponent.prototype`. So the property access `component.render` in `DOM.renderAll`
will be 2-way polymorphic.


## Inline cache states

Let's use a simplified example `components1.js` here to illustrate this:

```js
class Base { foo() {} }
class A extends Base { foo() { } }
class B extends Base { foo() { } }

function bar(instance) {
  return instance.foo();
}

bar(new A);
bar(new B);
bar(new A);
bar(new B);
```

Running this with [`d8`](https://github.com/v8/v8/wiki/Using-D8) and the `--trace-ic` flag we can see that the
`LoadIC` (inline cache) for the property access `instance.foo` goes polymorphic, indicated by the `P` state:

```
$ out/Release/d8 --trace-ic components1.js
$ tools/ic-processor
LoadIC (.->1) at ~bar components1.js:6:19 foo (map 0x8f24d80cca1)
LoadIC (1->P) at ~bar components1.js:6:19 foo (map 0x8f24d80cc01)

=====================
Load: 2
Store: 0
KeyedLoad: 0
KeyedStore: 0
StoreInArrayLiteral: 0
```

In V8 we have these five different states for `LoadIC`s right now:

Marker | Name             | Description
-------|------------------|-------------
`0`    | `UNINITIALIZED`  | The property access was not executed so far.
`.`    | `PREMONOMORPHIC` | The property access was executed once and we are likely going to go `MONOMORPHIC` on the next hit.
`1`    | `MONOMORPHIC`    | The property access was always executed with the same shape.
`P`    | `POLYMORPHIC`    | The property access was always executed with one of four different shapes.
`N`    | `MEGAMORPHIC`    | The property access has seen too many different shapes.

The initial `0->.` transition is not shown with `--trace-ic` currently, because V8 does that internally on the fast
path where no logging is hooked up right now. In the example above we run through `instance.foo` with two different
shapes for `instance`, either an instance of `A` with `foo` on `A.prototype`, or an instance of `B` with `foo` on
`B.prototype`.
Let's beef up the example a bit and add more than four different shapes like shown in `components2.js` below:

```js
class Base { foo() {} }
class A extends Base { foo() { } }
class B extends Base { foo() { } }
class C extends Base { foo() { } }
class D extends Base { foo() { } }
class E extends Base { foo() { } }

function bar(instance) {
  return instance.foo();
}

bar(new A);
bar(new B);
bar(new C);
bar(new D);
bar(new E);
bar(new A);
bar(new B);
bar(new C);
bar(new D);
bar(new E);
```

Running this through `d8` again with `--trace-ic` we see that we stay `POLYMORPHIC` for the first four shapes,
but then we go `MEGAMORPHIC` (as indicated by the `N` state) eventually (on the second instance of `A` in this
case due to the initial `PREMONOMORPHIC` step):

```
$ out/Release/d8 --trace-ic components2.js
$ tools/ic-processor
LoadIC (.->1) at ~bar components2.js:9:19 foo (map 0x15581a58ce81)
LoadIC (1->P) at ~bar components2.js:9:19 foo (map 0x15581a58cfc1)
LoadIC (P->P) at ~bar components2.js:9:19 foo (map 0x15581a58d0b1)
LoadIC (P->P) at ~bar components2.js:9:19 foo (map 0x15581a58d1a1)
LoadIC (P->N) at ~bar components2.js:9:19 foo (map 0x15581a58cde1)

=====================
Load: 5
Store: 0
KeyedLoad: 0
KeyedStore: 0
StoreInArrayLiteral: 0
```

The `MEGAMORPHIC` state is the *I don't know what to do about this* state of V8. Whenever a `LoadIC`
reaches the `MEGAMORPHIC` state, TurboFan will no longer be able to inline any fast-path for it (except for
some corner cases where TurboFan can find information about the object somewhere else), and will have to go
through the inline cache logic all the time instead. `MEGAMORPHIC` also indicates that the inline cache will
no longer try to cache information about how to access the property locally (i.e. on the property access site),
but instead fall back to a global cache (the so-called *megamorphic stub cache*).


## Scalability issues

This *megamorphic stub cache* is a global cache of fixed size where all `MEGAMORPHIC` sites will try to cache the
lookup information for properties. This is important to understand, as especially for big applications that means
you'll likely have a lot of contention on this resource. Highly polymorphic sites like `instance.foo` in the
example above are prime candidates for contenders, and you'll only be affected by this non-local effect once you
start integrating your applications or once you trigger a significant number of hash collisions on the global
cache with a single property access site.

```js
const N = 10000;

function test(fn) {
  var result;
  for (var i = 0; i < N; ++i) result = fn();
  return result;
}
test(x => x);

function makeNaive(klasses) {
  const instances = klasses.map(klass => new klass);
  return function naive() {
    let result;
    for (const instance of instances) result = instance.foo();
    return result;
  }
}

const DEGREES = [100, 300, 500, 700, 900];

for (const degree of DEGREES) {
  const KLASSES = [];
  for (let i = 0; i < degree; ++i) {
    KLASSES.push(eval('(class C' + i + ' { foo() { }})'));
  }

  const TESTS = [ makeNaive(KLASSES) ];

  for (var j = 0; j < TESTS.length; ++j) {
    test(TESTS[j]);
  }

  for (var j = 0; j < TESTS.length; ++j) {
    var startTime = Date.now();
    test(TESTS[j]);
    console.log(degree + ':', (Date.now() - startTime), 'ms.');
  }
}
```

The example above illustrates this problem, even with just a single access site `instance.foo` inside of the
`naive` function, and varying degrees of polymorphism. Running this through `d8` you'll see that the solution
doesn't scale very well:

```
$ out/Release/d8 components3.js
100: 43 ms.
300: 167 ms.
500: 1286 ms.
700: 1866 ms.
900: 2428 ms.
```

It actually scales very poorly since the VM spends more and more time missing on the global cache due to
collisions. Notice especially the cliff when going from 300 different shapes to 500 different shapes.


## A potential solution

Unfortunately big, component-based applications have naturally a high degree of polymorphism by design.
So what can you do to mitigate the negative impact? The main problem is having property accesses such
as `instance.foo` where `instance` can have a high number of different shapes. So if you try to not
have that many of these accesses in your application, you'll likely reduce the negative impact on the
global cache.

One way to do this is to simply load the method ahead of time, remember it together with the
object reference and then use
[`Function.prototype.call`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
in the hot loop. A convenient way to avoid having to carry around the pair of object and function
yourself is to use
[`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
instead.

```js
const N = 10000;

function test(fn) {
  var result;
  for (var i = 0; i < N; ++i) result = fn();
  return result;
}
test(x => x);

function makeNaive(klasses) {
  const instances = klasses.map(klass => new klass);
  return function naive() {
    let result;
    for (const instance of instances) result = instance.foo();
    return result;
  }
}

function makeCall(klasses) {
  const pairs = klasses.map(klass => {
    const instance = new klass();
    const method = instance.foo;
    return {instance, method};
  });
  return function call() {
    let result;
    for (const {instance, method} of pairs) {
      result = method.call(instance);
    }
    return result;
  }
}

function makeBound(klasses) {
  const fns = klasses.map(klass => {
    const instance = new klass();
    return instance.foo.bind(instance);
  });
  return function bound() {
    let result;
    for (const fn of fns) result = fn();
    return result;
  }
}

const DEGREES = [100, 300, 500, 700, 900];

for (const degree of DEGREES) {
  const KLASSES = [];
  for (let i = 0; i < degree; ++i) {
    KLASSES.push(eval('(class C' + i + ' { foo() { }})'));
  }

  const TESTS = [ makeBound(KLASSES), makeCall(KLASSES), makeNaive(KLASSES) ];

  for (var j = 0; j < TESTS.length; ++j) {
    test(TESTS[j]);
  }

  for (var j = 0; j < TESTS.length; ++j) {
    var startTime = Date.now();
    test(TESTS[j]);
    console.log(
        degree + '|' + TESTS[j].name + ':', (Date.now() - startTime), 'ms.');
  }
}
```

Both approaches scale equally well and avoid the problem of hot `MEGAMORPHIC` property accesses.

![Results][1]

So the takeaway here is that a high degree of polymorphism is not bad per se, but if you have a
lot of `MEGAMORPHIC` property accesses on the critical path, then eventually your application is
going to spend a lot of time fighting for entries in the *megamorphic stub cache* (at least with
how V8 works currently). For component-based systems there are ways to avoid this situation by
preloading methods used in hot code later.

  [1]: /images/2018/results-20180323.png "results.png"
