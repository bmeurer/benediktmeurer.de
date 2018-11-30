---
layout: post
title: The case of temporary objects in Chrome
---

For the last couple of months we - together with some awesome [Ember](https://twitter.com/stefanpenner) [folks](https://twitter.com/krisselden) - have
been hunting a terrible bug in V8, that I used to call *"the Ember issue"*, because this bug especially affects
websites based on the [Ember.js framework](http://emberjs.com). Ember.js was never really great in Chrome - i.e. there have been reports of [serious
performance problems](https://bugs.chromium.org/p/v8/issues/detail?id=2935) in 2013 already, when I had just joined the V8 team - but it seems like
it got worse recently, leading to increased load time and pretty serious jank - up to two second pauses - even though we spent a lot of resources
on techniques like the [Idle-Time Garbage Collection Scheduling](http://v8project.blogspot.de/2015/08/getting-garbage-collection-for-free.html) and
other [jank](http://v8project.blogspot.de/2015/10/jank-busters-part-one.html) [related](http://v8project.blogspot.de/2016/04/jank-busters-part-two-orinoco.html)
improvements that should avoid exactly these problems.

## The fundamental problem

The immediate cause of the problem is the way we deal with [hidden classes](https://github.com/v8/v8/wiki/Design%20Elements) - which we call maps in V8 -
for short-living, temporary objects (in some rare cases this could also bite you with long-living objects, but that's unlikely). Consider the following
simple example script:

{% highlight javascript %}
// Some simple 2D point class with distance helper function.
function Point(x, y) {
  this.x = x;
  this.y = y;
}
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Some user of the Point class, computing the distance of (x, y) to the origin.
function distanceToOrigin(x, y) {
  const origin = new Point(0, 0);
  const point = new Point(x, y);
  return distance(point, origin);
}

// Warm up the feedback for all functions above.
print("--- Before warmup ---");
distanceToOrigin(42, 24);
distanceToOrigin(42, 24);
print("--- After warmup ---");

// Let's see.
print(distanceToOrigin(42, 24));
{% endhighlight %}

Let's execute this simple example ``ex1.js`` in the [d8 shell](https://developers.google.com/v8/build), using a Debug build of V8. Then we observe the
following output:

{% highlight console %}
$ out/Debug/d8 ex1.js
--- Before warmup ---
--- After warmup ---
48.373546489791295
$ 
{% endhighlight %}

That shouldn't come as a surpise. So let's see what's going on under the hood, and trace the maps (aka hidden classes) that we create. We can do this using
the ``--trace-maps`` command line flag in ``d8``:

{% highlight console %}
$ out/Debug/d8 ex1.js --trace-maps
...SNIP...
--- Before warmup ---
[TraceMaps: Normalize from= 0x26e525887cc1 to= 0x26e52588a131 reason= NormalizeAsPrototype ]
[TraceMaps: ReplaceDescriptors from= 0x26e52588a131 to= 0x26e52588a189 reason= CopyAsPrototype ]
[TraceMaps: InitialMap map= 0x26e52588a0d9 SFI= 34_Point ]
[TraceMaps: Transition from= 0x26e52588a0d9 to= 0x26e52588a1e1 name= x ]
[TraceMaps: Transition from= 0x26e52588a1e1 to= 0x26e52588a239 name= y ]
[TraceMaps: SlowToFast from= 0x26e52588a189 to= 0x26e52588a291 reason= OptimizeAsPrototype ]
--- After warmup ---
48.373546489791295
$ 
{% endhighlight %}

So what happens here is that create a so called *initial map* for the ``Point`` constructor, which is located at address ``0x26e52588a0d9`` in this case,
and then while executing the ``Point`` constructor first transition ``this`` from the initial map ``0x26e52588a0d9`` to the map ``0x26e52588a1e1`` adding
a property ``x``, and then further transition that map to ``0x26e52588a239`` adding the ``y`` property. The transition tree for the final ``Point`` map
(i.e. for all instances that come out of the ``Point`` constructor) is thus:

<center><a href="/images/2016/ex1-point-20161011.png"><img src="/images/2016/ex1-point-20161011.png" /></a></center>

Now let's see what happens if we call ``distanceToOrigin`` another time, i.e. add another line

{% highlight javascript %}
print(distanceToOrigin(2, 2));
{% endhighlight %}

at the end of ``ex1.js`` and execute that with the tracing flag:

{% highlight console %}
$ out/Debug/d8 ex1.js --trace-maps
...SNIP...
--- Before warmup ---
[TraceMaps: Normalize from= 0x26e525887cc1 to= 0x26e52588a131 reason= NormalizeAsPrototype ]
[TraceMaps: ReplaceDescriptors from= 0x26e52588a131 to= 0x26e52588a189 reason= CopyAsPrototype ]
[TraceMaps: InitialMap map= 0x26e52588a0d9 SFI= 34_Point ]
[TraceMaps: Transition from= 0x26e52588a0d9 to= 0x26e52588a1e1 name= x ]
[TraceMaps: Transition from= 0x26e52588a1e1 to= 0x26e52588a239 name= y ]
[TraceMaps: SlowToFast from= 0x26e52588a189 to= 0x26e52588a291 reason= OptimizeAsPrototype ]
--- After warmup ---
48.373546489791295
2.8284271247461903
$ 
{% endhighlight %}

As you can see we don't need to create new maps for the second iteration again, but reuse the existing transition tree that was created during
warmup. So far the garbage collector was not involved at all. We can easily verify that by running the example with the ``--trace-gc`` flag:

{% highlight console %}
$ out/Debug/d8 ex1.js --trace-gc
--- Before warmup ---
--- After warmup ---
48.373546489791295
2.8284271247461903
$ 
{% endhighlight %}

Let's see what happens if we add the GC to the mix, which can be done explicitly in the ``d8`` shell by passing the ``--expose-gc`` command
flag, which enables you to manually trigger a full GC by calling the ``gc`` object. Consider the following ``ex2.js``:

{% highlight javascript %}
// Some simple 2D point class with distance helper function.
function Point(x, y) {
  this.x = x;
  this.y = y;
}
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Some user of the Point class, computing the distance of (x, y) to the origin.
function distanceToOrigin(x, y) {
  const origin = new Point(0, 0);
  const point = new Point(x, y);
  return distance(point, origin);
}

// Warm up the feedback for all functions above.
print("--- Before warmup ---");
distanceToOrigin(42, 24);
distanceToOrigin(42, 24);
print("--- After warmup ---");

// Let's see.
print(distanceToOrigin(42, 24));

// Manually trigger GC.
gc();

// Let's see again.
print(distanceToOrigin(2, 2));
{% endhighlight %}

Again running this with ``--trace-gc`` (and ``--expose-gc``) to verify that we really trigger a GC here:

{% highlight console %}
$ out/Debug/d8 ex2.js --expose-gc --trace-gc
--- Before warmup ---
--- After warmup ---
48.373546489791295
[3701:0x7f33fb799120]       32 ms: Mark-sweep 1.1 (6.0) -> 1.1 (7.0) MB, 16.3 / 0.0 ms  testing GC in old space requested
2.8284271247461903
$ 
{% endhighlight %}

So let's run this with ``--trace-maps`` to observe the difference we get when the GC is involved:

{% highlight console %}
$ out/Debug/d8 ex2.js --expose-gc --trace-gc --trace-maps
...SNIP...
--- Before warmup ---
[TraceMaps: ReplaceDescriptors from= 0x8e7a5d0a0d9 to= 0x8e7a5d0a239 reason= CopyAsPrototype ]
[TraceMaps: InitialMap map= 0x8e7a5d0a1e1 SFI= 37_Point ]
[TraceMaps: Transition from= 0x8e7a5d0a1e1 to= 0x8e7a5d0a291 name= x ]
[TraceMaps: Transition from= 0x8e7a5d0a291 to= 0x8e7a5d0a2e9 name= y ]
[TraceMaps: SlowToFast from= 0x8e7a5d0a239 to= 0x8e7a5d0a341 reason= OptimizeAsPrototype ]
--- After warmup ---
48.373546489791295
[4286:0x7f3fea0e3120]       34 ms: Mark-sweep 1.1 (6.0) -> 1.1 (7.0) MB, 15.6 / 0.0 ms  testing GC in old space requested
[TraceMaps: Transition from= 0x8e7a5d0a1e1 to= 0x8e7a5d0a239 name= x ]
[TraceMaps: Transition from= 0x8e7a5d0a239 to= 0x8e7a5d0a291 name= y ]
2.8284271247461903
$ 
{% endhighlight %}

This seems weird on first sight: We re-create the transition tree for the final ``Point`` map after the full GC. Don't get confused
with the addresses here, these are the same because we have a separate space for maps, where we do free list allocation and thus
reuse reclaimed map slots immediately most of the time. What happens here is that we create the transitions from the initial map
``0x8e7a5d0a1e1`` of ``Point`` to the final map ``0x8e7a5d0a2e9`` which contains both ``x`` and ``y`` during warmup and then invoke
the ``distanceToOrigin`` function once. Afterwards we trigger a major GC cycle, and call into ``distanceToOrigin`` again, which now
creates a new transition tree from the initial map ``0x8e7a5d0a1e1`` to ``0x8e7a5d0a239`` for ``x`` and then to ``0x8e7a5d0a291``
for ``y`` (as said, after the GC cycle these addresses correspond to new maps, don't confuse them with the maps printed earlier).

<center><a href="/images/2016/ex2-point-20161011.png"><img src="/images/2016/ex2-point-20161011.png" /></a></center>

This happens because we don't have any live object that points to the final ``Point`` map ``0x8e7a5d0a2e9`` (which includes
 ``x`` and ``y``) when the garbage collector runs, and so the GC nukes the final map ``0x8e7a5d0a2e9`` (and the intermediate map
``0x8e7a5d0a291`` that contains only ``x``). The initial map ``0x8e7a5d0a1e1`` is strongly referenced from the closure for the
``Point`` constructor and therefore not nuked by the GC. This is valid because the links in the transition trees are actually
weak pointers in V8. Assuming we would have a live object with the final ``Point`` map when the GC runs, then we wouldn't nuke
the maps and thus wouldn't have to re-create the transition trees, i.e. considering another mutation of the example:

{% highlight javascript %}
// Some simple 2D point class with distance helper function.
function Point(x, y) {
  this.x = x;
  this.y = y;
}
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Some user of the Point class, computing the distance of (x, y) to the origin.
function distanceToOrigin(x, y) {
  const origin = new Point(0, 0);
  const point = new Point(x, y);
  return distance(point, origin);
}

// Warm up the feedback for all functions above.
print("--- Before warmup ---");
distanceToOrigin(42, 24);
distanceToOrigin(42, 24);
print("--- After warmup ---");

// Let's see.
print(distanceToOrigin(42, 24));

// Manually trigger GC, with live Point object.
(function(o) { gc(); })(new Point(1, 1));

// Let's see again.
print(distanceToOrigin(2, 2));
{% endhighlight %}

Now running this script ``ex3.js``, we observe the expected behavior (i.e. re-using the maps that were created during the initial
warmup phase):

{% highlight console %}
$ out/Debug/d8 ex3.js --expose-gc --trace-gc --trace-maps
...SNIP...
--- Before warmup ---
[TraceMaps: ReplaceDescriptors from= 0x3e7294b8a0d9 to= 0x3e7294b8a239 reason= CopyAsPrototype ]
[TraceMaps: InitialMap map= 0x3e7294b8a1e1 SFI= 37_Point ]
[TraceMaps: Transition from= 0x3e7294b8a1e1 to= 0x3e7294b8a291 name= x ]
[TraceMaps: Transition from= 0x3e7294b8a291 to= 0x3e7294b8a2e9 name= y ]
[TraceMaps: SlowToFast from= 0x3e7294b8a239 to= 0x3e7294b8a341 reason= OptimizeAsPrototype ]
--- After warmup ---
48.373546489791295
[6069:0x7effd4328120]       34 ms: Mark-sweep 1.1 (6.0) -> 1.1 (7.0) MB, 16.2 / 0.0 ms  testing GC in old space requested
2.8284271247461903
$ 
{% endhighlight %}

To summarize, the performance issue here is that we constantly need to re-learn all the hidden classes for short-living,
temporary objects, and that is fairly slow, since we need to re-create all the metadata for tracking, plus all the [inline
caches](http://mrale.ph/blog/2012/06/03/explaining-js-vms-in-js-inline-caches.html) that already picked up feedback for
the original maps have to re-learn the new maps. This can be seen by running the ``ex2.js`` with ``--trace-ic`` to visualize
the ICs:

{% highlight console %}
$ out/Debug/d8 ex2.js --expose-gc --trace-gc --trace-ic
...SNIP...
[LoadGlobalIC in ~+98 at ex2.js:20 (0->1) map=0x1dce36c09d11 0x1032c1ca8419 <String[5]: print>]
[CallIC in ~+143 at ex2.js:20 (0->1) map=(nil) 0x272903502231 <String[5]: print>]
--- Before warmup ---
[CallIC in ~+223 at ex2.js:21 (0->1) map=(nil) 0x1032c1cac1e9 <String[16]: distanceToOrigin>]
[LoadGlobalIC in ~distanceToOrigin+69 at ex2.js:14 (0->1) map=0x1dce36c09d11 0x1032c1cac129 <String[5]: Point>]
[StoreIC in ~Point+65 at ex2.js:3 (0->.) map=0x1dce36c0a1e1 0xf2c244099a9 <String[1]: x>]
[StoreIC in ~Point+102 at ex2.js:4 (0->.) map=0x1dce36c0a291 0xf2c2440e189 <String[1]: y>]
[StoreIC in ~Point+65 at ex2.js:3 (.->1) map=0x1dce36c0a1e1 0xf2c244099a9 <String[1]: x>]
[StoreIC in ~Point+102 at ex2.js:4 (.->1) map=0x1dce36c0a291 0xf2c2440e189 <String[1]: y>]
[LoadGlobalIC in ~distanceToOrigin+201 at ex2.js:16 (0->1) map=0x1dce36c09d11 0x1032c1cac149 <String[8]: distance>]
[CallIC in ~distanceToOrigin+240 at ex2.js:16 (0->1) map=(nil) 0x1032c1cac149 <String[8]: distance>]
[LoadIC in ~distance+86 at ex2.js:7 (0->.) map=0x1dce36c0a2e9 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+123 at ex2.js:7 (0->.) map=0x1dce36c0a2e9 0xf2c244099a9 <String[1]: x>]
[BinaryOpIC(SUB:None*None->None) => (SUB:Smi*Smi->Smi) @ 0x24b4171b94c1 <- ~distance+133 at ex2.js:7]
[LoadIC in ~distance+170 at ex2.js:8 (0->.) map=0x1dce36c0a2e9 0xf2c2440e189 <String[1]: y>]
[LoadIC in ~distance+207 at ex2.js:8 (0->.) map=0x1dce36c0a2e9 0xf2c2440e189 <String[1]: y>]
[BinaryOpIC(SUB:None*None->None) => (SUB:Smi*Smi->Smi) @ 0x24b4171b94c1 <- ~distance+217 at ex2.js:8]
[LoadGlobalIC in ~distance+237 at ex2.js:9 (0->1) map=0x1dce36c09d11 0xf2c244464b1 <String[4]: Math>]
[LoadIC in ~distance+267 at ex2.js:9 (0->.) map=0x1dce36c04cf9 0xf2c24448271 <String[4]: sqrt>]
[BinaryOpIC(MUL:None*None->None) => (MUL:Smi*Smi->Smi) @ 0x24b4171a60c1 <- ~distance+292 at ex2.js:9]
[BinaryOpIC(MUL:None*None->None) => (MUL:Smi*Smi->Smi) @ 0x24b4171a60c1 <- ~distance+307 at ex2.js:9]
[BinaryOpIC(ADD:None*None->None) => (ADD:Smi*Smi->Smi) @ 0x24b4171939a1 <- ~distance+314 at ex2.js:9]
[CallIC in ~+303 at ex2.js:22 (0->1) map=(nil) 0x1032c1cac1e9 <String[16]: distanceToOrigin>]
[LoadIC in ~distance+86 at ex2.js:7 (.->1) map=0x1dce36c0a2e9 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+123 at ex2.js:7 (.->1) map=0x1dce36c0a2e9 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+170 at ex2.js:8 (.->1) map=0x1dce36c0a2e9 0xf2c2440e189 <String[1]: y>]
[LoadIC in ~distance+207 at ex2.js:8 (.->1) map=0x1dce36c0a2e9 0xf2c2440e189 <String[1]: y>]
[LoadIC in ~distance+267 at ex2.js:9 (.->1) map=0x1dce36c04cf9 0xf2c24448271 <String[4]: sqrt>]
[CallIC in ~+371 at ex2.js:23 (0->1) map=(nil) 0x272903502231 <String[5]: print>]
--- After warmup ---
[CallIC in ~+479 at ex2.js:26 (0->1) map=(nil) 0x1032c1cac1e9 <String[16]: distanceToOrigin>]
[CallIC in ~+507 at ex2.js:26 (0->1) map=(nil) 0x272903502231 <String[5]: print>]
48.373546489791295
[LoadGlobalIC in ~+530 at ex2.js:29 (0->1) map=0x1dce36c09d11 0x1032c1cab9c1 <String[2]: gc>]
[CallIC in ~+563 at ex2.js:29 (0->1) map=(nil) 0x1032c1cab9c1 <String[2]: gc>]
[7068:0x7f71b1891120]       35 ms: Mark-sweep 1.1 (6.0) -> 1.1 (7.0) MB, 16.8 / 0.0 ms  testing GC in old space requested
[CallIC in ~+671 at ex2.js:32 (0->1) map=(nil) 0x1032c1cac1e9 <String[16]: distanceToOrigin>]
[StoreIC in ~Point+65 at ex2.js:3 (^->1) map=0x1dce36c0a1e1 0xf2c244099a9 <String[1]: x>]
[StoreIC in ~Point+102 at ex2.js:4 (1->1) map=0x1dce36c0a239 0xf2c2440e189 <String[1]: y>]
[LoadIC in ~distance+86 at ex2.js:7 (1->1) map=0x1dce36c0a291 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+123 at ex2.js:7 (1->1) map=0x1dce36c0a291 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+170 at ex2.js:8 (1->1) map=0x1dce36c0a291 0xf2c2440e189 <String[1]: y>]
[LoadIC in ~distance+207 at ex2.js:8 (1->1) map=0x1dce36c0a291 0xf2c2440e189 <String[1]: y>]
[CallIC in ~+699 at ex2.js:32 (0->1) map=(nil) 0x1a5946502231 <String[5]: print>]
2.8284271247461903
$ 
{% endhighlight %}

Let's only look at the ``LoadIC``s in ``distance``, i.e. the inline caches for the property accesses
to the ``p1`` and ``p2`` objects in the first two lines of ``distance``:

{% highlight console %}
$ out/Debug/d8 ex2.js --expose-gc --trace-gc --trace-ic
...SNIP...
--- Before warmup ---
...SNIP...
[LoadIC in ~distance+86 at ex2.js:7 (0->.) map=0x1dce36c0a2e9 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+123 at ex2.js:7 (0->.) map=0x1dce36c0a2e9 0xf2c244099a9 <String[1]: x>]
...SNIP...
[LoadIC in ~distance+170 at ex2.js:8 (0->.) map=0x1dce36c0a2e9 0xf2c2440e189 <String[1]: y>]
[LoadIC in ~distance+207 at ex2.js:8 (0->.) map=0x1dce36c0a2e9 0xf2c2440e189 <String[1]: y>]
...SNIP...
[LoadIC in ~distance+86 at ex2.js:7 (.->1) map=0x1dce36c0a2e9 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+123 at ex2.js:7 (.->1) map=0x1dce36c0a2e9 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+170 at ex2.js:8 (.->1) map=0x1dce36c0a2e9 0xf2c2440e189 <String[1]: y>]
[LoadIC in ~distance+207 at ex2.js:8 (.->1) map=0x1dce36c0a2e9 0xf2c2440e189 <String[1]: y>]
...SNIP...
--- After warmup ---
...SNIP...
48.373546489791295
...SNIP...
[7068:0x7f71b1891120]       35 ms: Mark-sweep 1.1 (6.0) -> 1.1 (7.0) MB, 16.8 / 0.0 ms  testing GC in old space requested
...SNIP...
[LoadIC in ~distance+86 at ex2.js:7 (1->1) map=0x1dce36c0a291 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+123 at ex2.js:7 (1->1) map=0x1dce36c0a291 0xf2c244099a9 <String[1]: x>]
[LoadIC in ~distance+170 at ex2.js:8 (1->1) map=0x1dce36c0a291 0xf2c2440e189 <String[1]: y>]
[LoadIC in ~distance+207 at ex2.js:8 (1->1) map=0x1dce36c0a291 0xf2c2440e189 <String[1]: y>]
...SNIP...
2.8284271247461903
$ 
{% endhighlight %}

What we observe is that during warmup (which includes two calls to ``distance``) the ``LoadIC``s
transition from *uninitialized* state (indicated by the ``0``) to *premonomorphic* state (indicated
by the ``.``) and from that to *monomorphic* state (indicated by the ``1``) for the final ``Point``
map ``0x1dce36c0a2e9``, which is ideal and exactly what we want. But then after the GC cycles, all
of these ``LoadIC``s miss again and have to re-learn the new final map ``0x1dce36c0a291``. Fortunately
they stay *monomorphic* at least, because the old maps died during garbage collection.

## Adding weak references in optimized code to the mix

The fundamental problem described above is already pretty bad and causes significant regressions in execution speed
while leading to already noticable jank at the same time, but it only gets really bad once you add the optimizing
compiler to the mix. More precisely not the optimizing compiler itself, but the fact that references to maps and JavaScript
objects (and contexts) from optimized code are considered weak. Initially all references embedded in optimized code
objects were strong references, but that caused terrible memory leaks where a single code object could keep an entire
``<iframe>`` alive (a *native context* in V8 terminology), so we had to fix that. However in the process of doing so,
we [multiplied the impact of the fundamental problem](https://bugs.chromium.org/p/v8/issues/detail?id=3664), for
example consider what the optimizing compiler does when we add it to the equation:

{% highlight javascript %}
// Some simple 2D point class with distance helper function.
function Point(x, y) {
  this.x = x;
  this.y = y;
}
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Some user of the Point class, computing the distance of (x, y) to the origin.
function distanceToOrigin(x, y) {
  const origin = new Point(0, 0);
  const point = new Point(x, y);
  return distance(point, origin);
}

// Warm up the feedback for all functions above.
print("--- Before warmup ---");
distanceToOrigin(42, 24);
distanceToOrigin(42, 24);
print("--- After warmup ---");

// Let's see.
%OptimizeFunctionOnNextCall(distance);
print(distanceToOrigin(42, 24));
print("--- After optimized ---");

// Manually trigger GC.
gc();

// Let's see again.
print(distanceToOrigin(2, 2));
{% endhighlight %}

We use the ``%OptimizeFunctionOnNextCall`` intrinsic in the ``d8`` shell to forcibly mark the function ``distance`` for optimization
 when it's called the next time. We need to pass the ``--allow-natives-syntax`` command flag to ``d8`` to enable the use of these
intrinsics. So let's run this ``ex4.js`` with ``--trace-opt`` and ``--trace-deopt`` to check what the optimized code is
doing:

{% highlight console %}
$ out/Debug/d8 ex4.js --allow-natives-syntax --expose-gc --trace-gc --trace-opt --trace-deopt
...SNIP...
--- Before warmup ---
--- After warmup ---
[compiling method 0x3577c29acc09 <JS Function distance (SharedFunctionInfo 0x3577c29ac679)> using Crankshaft]
[optimizing 0x3577c29acc09 <JS Function distance (SharedFunctionInfo 0x3577c29ac679)> - took 0.615, 0.701, 0.263 ms]
48.373546489791295
--- After optimized ---
[marking dependent code 0x349bf4685b01 (opt #0) for deoptimization, reason: weak-code]
[deoptimize marked code in all contexts]
[deoptimizer unlinked: distance / 3577c29acc09]
[evicting entry from optimizing code map (deoptimized code) for 0x3577c29ac679 <SharedFunctionInfo distance>]
[8274:0x7fef1862c180]       33 ms: Mark-sweep 1.1 (6.0) -> 1.1 (7.0) MB, 15.8 / 0.0 ms  testing GC in old space requested
2.8284271247461903
$ 
{% endhighlight %}

As expected we optimize the function ``distance`` during warmup and can use the optimized code afterwards. However during
the garbage collection we mark exactly this optimized code object for deoptimization and eventually unlink the optimized
code from the ``distance`` function, replacing it with the unoptimized code again. The reason is ``weak-code``, which means
that this particular code object contains a weak reference to some ``HeapObject`` that just died during this GC cycle. In
this case we have weak references to the final ``Point`` map embedded into the code object because we inlined the property
accesses to ``x`` and ``y`` in the beginning of ``distance``, as can be seen by looking at the optimized code that is
generated for ``distance`` (when running with the ``--print-opt-code --code-comments`` command line flags):

{% highlight nasm %}
...SNIP...
0x2e1542b05b83    35  488b4518       REX.W movq rax,[rbp+0x18]
                  ;;; <@24,#16> check-non-smi
0x2e1542b05b87    39  a801           test al,0x1
0x2e1542b05b89    41  0f8411010000   jz 320  (0x2e1542b05ca0)
                  ;;; <@26,#17> check-maps
0x2e1542b05b8f    47  49bae9a2706720250000 REX.W movq r10,0x25206770a2e9    ;; object: 0x25206770a2e9 <Map(FAST_HOLEY_ELEMENTS)>
0x2e1542b05b99    57  4c3950ff       REX.W cmpq [rax-0x1],r10
0x2e1542b05b9d    61  0f8502010000   jnz 325  (0x2e1542b05ca5)
                  ;;; <@28,#18> load-named-field
0x2e1542b05ba3    67  8b581b         movl rbx,[rax+0x1b]
                  ;;; <@29,#18> gap
0x2e1542b05ba6    70  488b5510       REX.W movq rdx,[rbp+0x10]
                  ;;; <@30,#19> check-non-smi
0x2e1542b05baa    74  f6c201         testb rdx,0x1
0x2e1542b05bad    77  0f84f7000000   jz 330  (0x2e1542b05caa)
                  ;;; <@32,#20> check-maps
0x2e1542b05bb3    83  49bae9a2706720250000 REX.W movq r10,0x25206770a2e9    ;; object: 0x25206770a2e9 <Map(FAST_HOLEY_ELEMENTS)>
0x2e1542b05bbd    93  4c3952ff       REX.W cmpq [rdx-0x1],r10
0x2e1542b05bc1    97  0f85e8000000   jnz 335  (0x2e1542b05caf)
                  ;;; <@34,#21> load-named-field
0x2e1542b05bc7   103  8b4a1b         movl rcx,[rdx+0x1b]
...SNIP...
{% endhighlight %}

These two references to the final ``Point`` map ``0x25206770a2e9`` are treated weakly by the garbage collector, which means
that the code object becomes invalid once the target objects die. Thus V8 has to deoptimize in this case, which means we need
to go back to unoptimized code and eventually re-optimize when the function becomes hot again with the new maps. But there's
a catch: You can only do this for a certain number of times until V8 gives up on optimizing this function completely, i.e.
let's run this in a loop

{% highlight javascript %}
// Some simple 2D point class with distance helper function.
function Point(x, y) {
  this.x = x;
  this.y = y;
}
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Some user of the Point class, computing the distance of (x, y) to the origin.
function distanceToOrigin(x, y) {
  const origin = new Point(0, 0);
  const point = new Point(x, y);
  return distance(point, origin);
}

// Warm up the feedback for all functions above.
print("--- Before warmup ---");
distanceToOrigin(42, 24);
distanceToOrigin(42, 24);
print("--- After warmup ---");

for (let i = 1; i <= 12; ++i) {
  // Let's see.
  % OptimizeFunctionOnNextCall(distance);
  distanceToOrigin(42, 24);
  print('--- After optimized ' + i + ' ---');

  // Manually trigger GC.
  gc();

  // Let's see again.
  distanceToOrigin(2, 2);
}
{% endhighlight %}

and check the output with ``--trace-opt``:

{% highlight console %}
$ out/Debug/d8 ex5.js --allow-natives-syntax --expose-gc --trace-opt
...SNIP...
--- Before warmup ---
--- After warmup ---
[compiling method 0x51ae02ccb9 <JS Function distance (SharedFunctionInfo 0x51ae02c6b9)> using Crankshaft]
[optimizing 0x51ae02ccb9 <JS Function distance (SharedFunctionInfo 0x51ae02c6b9)> - took 0.592, 0.739, 0.308 ms]
--- After optimized 1 ---
[evicting entry from optimizing code map (deoptimized code) for 0x51ae02c6b9 <SharedFunctionInfo distance>]
[compiling method 0x51ae02ccb9 <JS Function distance (SharedFunctionInfo 0x51ae02c6b9)> using Crankshaft]
[optimizing 0x51ae02ccb9 <JS Function distance (SharedFunctionInfo 0x51ae02c6b9)> - took 0.362, 0.674, 0.214 ms]
...SNIP...
--- After optimized 11 ---
[evicting entry from optimizing code map (deoptimized code) for 0x51ae02c6b9 <SharedFunctionInfo distance>]
[disabled optimization for 0x51ae02c6b9 <SharedFunctionInfo distance>, reason: Optimized too many times]
--- After optimized 12 ---
$ 
{% endhighlight %}

Oops, so after we did this 11 times, there's no way to have the ``distance`` function optimized again, and you will be
stuck with unoptimized baseline code. For heavy framework based websites / webapps it usually doesn't take long to
trigger 11 major GCs, so it's likely that you run in unoptimized code after some time. Ironically this is not even a
bad thing per-se, as you do at least no longer waste time optimizing and deoptimizing the hot functions all the time
(yet you still pay for the fundamental transition tree re-creation plus IC re-learning problem). But often it is [pretty
bad](https://github.com/nodejs/node/issues/8670) if we give up on optimizing hot functions.

Now what causes the terrible jank that we observed with various Ember.js based web applications is when this happens
inside some hot, recursive functions, i.e. when this affects the core rendering functionality. Because what happens in
that case is you are deep inside the recursive renderering and happen to finish a GC cycles, which nukes a couple of
maps that your render functions have weak references to. Now you cannot just throw away the optimized code objects,
since you have activations of those on the stack (and V8 shares the native stack with C++, thus we need to be nice to
C++ as well), so what we do instead is, we mark the optimized code objects for *lazy deoptimization*, which means
that the code object will be deoptimized once you go back to the activation. Now if you have a few hundreds of activations
of affected code objects, you'll see a chain reaction of lazy deoptimizations, i.e. whenever you go back one step in
the recursion you first trigger the ``Deoptimizer`` (which is fairly expensive) and then continue execution in unoptimized
code, until this activation returns as well and triggers the ``Deoptimizer`` in the parent activation, and so on,
resulting in a [*deoptimization storm*](https://bugs.chromium.org/p/v8/issues/detail?id=5456).

One question that puzzled me for some time is why did this get (sometimes way) worse with the [Idle-Time Garbage
Collection Scheduling](http://v8project.blogspot.de/2015/08/getting-garbage-collection-for-free.html), which should
actually reduce observable jank noticably instead, especially on mobile devices. As it turns out, the answer is fairly
simple: With idle scheduling it is far less likely (actually close to impossible) that the garbage collector ever sees
one of these temporary live objects because most garbage collection cycles are now started in idle time, while previously
most of them were started from the hot functions, which means it was somewhat likely at least that there was a stack
root pointing to one of these temporary objects, which in turn would keep the transition maps alive.

## Where to go from here?

With some confidence that this is really the problem people are running into with Chrome, we went on to figure out
why we do actually run into this problem after all. Obviously we wouldn't have this problem at all if links in the
transition trees weren't weak, and it turns out that this is really the root cause that we need to address. Currently
those links have to be weak because ``Map``s in V8 point back to arbitrary JavaScript objects:

1. The prototype of an object is stored in it's ``Map``.
2. Constant functions are tracked in the ``Map`` of objects.

The first problem is not really a problem, because most of the time the prototype is strongly referenced from the
initial map (which in turn is strongly referenced from the constructor function) already, and thus we don't create
a memory leak here. It's only an issue when a new prototype set for an existing object. So for these cases we will introduce
special links in the transition trees to ensure that maps for prototype transitions aren't strongly linked from their
initial maps.

The second problem is pretty serious, because holding on to closures strongly from maps that aren't used by any
live objects could easily create very expensive context leaks (i.e. the function context, and in case of cross-context
 leaks, the whole native context). But thanks
to some previous work on prototype maps, we are now able to completely avoid tracking the actual constants on the
``Map``s and instead only track the *constantness* of a field, and utilize prototype information to still be able
to inline calls to methods on the prototype. See the [design document](https://docs.google.com/document/d/1VEeXn6BfKmVkYpfMuxNs3otLLNPIxIVA1cLoSwGMIxI)
for details.
