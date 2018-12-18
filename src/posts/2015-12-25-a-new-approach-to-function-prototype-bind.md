---
layout: post
title: A new approach to Function.prototype.bind
tags:
  - javascript
  - performance
  - v8
---

The performance and compatibility of [Function.prototype.bind](http://tc39.github.io/ecma262/#sec-function.prototype.bind) and the resulting bound
function objects has traditionally always been an issue in [V8](https://developers.google.com/v8) (and thereby in [Chromium](https://www.chromium.org)
based browsers and [Node.js](https://nodejs.org) driven servers).

Consider the following simple test driver, which defines a (non-trivial) test function `foo` and creates two bound functions `foo1` and `foo2`
based on it, which both bind the receiver and the first argument to some primitive.

```js
"use strict";
function foo(x, y, z) {
  return this + x + y + z;
}
var foo1 = foo.bind(1, 0);
var foo2 = foo.bind(2, 1);
function test() {
  // Performance test.
  var sum = 0;
  const limit = 1000;
  for (var y = 0; y < limit; ++y) {
    for (var z = 0; z < limit; ++z) {
      sum += foo1(y, z) + foo2(y, z);
    }
  }
  return sum;
}
for (let i = 0; i < 10; ++i) test(); // Warmup first.
var startTime = Date.now();
for (let i = 0; i < 10; ++i) test();
var endTime = Date.now();
print("Time: " + (endTime - startTime) + "ms.");
```

Now running this program with V8 tip-of-tree as of today requires a whopping 12,078ms to execute the test loop on a HP z620 work station running
Ubuntu 14.04. Looking at the performance profile, almost all the time is spend in the
[`boundFunction`](https://github.com/v8/v8/blob/fc23b4949850e68a0877e3426c438ce0f710613d/src/js/v8natives.js#L1239) builtin (and the associated
helper runtime functions) that acts as a trampoline for bound functions. Looking closely into that function, we see that on every possible [[Call]]
path through the function (the [[Construct]] path uses the `%NewObjectFromBound` C++ builtin), we bailout to C++ at least twice, once into
`%BoundFunctionGetBindings`, which returns a new Array with the bound target function, the bound this and the bound arguments, and once into
`%Apply`, which calls back into JavaScript to execute the actual target function with the actual parameters.

Calling into C++ is certainly not fast in V8, but calling back from C++ into JavaScript is very expensive. Also building one or two temporary
Arrays on every invocation of a bound function is not cheap, and can cause unnecessary GC traffic. So, there's a lot of room for improvement
here. I've been working on a new approach to implement [Bound Function Exotic Objects](http://tc39.github.io/ecma262/#sec-bound-function-exotic-objects)
in V8 for a few months now, as part of a bigger project to fully support objects with [[Call]] and [[Construct]] internal methods that are not
ECMAScript Function objects, i.e. to support [Proxy Objects](http://tc39.github.io/ecma262/#sec-proxy-objects). After a lot of yak shaving,
I now reached a point where I'm close to landing my new [baseline implementation for Function.prototype.bind](https://crrev.com/1542963002).

Running the test program above with my patch requires 239ms for the test loop, which is already a **50x improvement**. There's still some
more cleanup to be done in order to land the patch (i.e. some API functions seem to require additional work to deal properly with the new
representation of bound function objects), but the baseline results are already very promising. Once the baseline implementation is stabilized,
we can start looking into optimizing bound functions, i.e. enable inlining of bound functions - which should boost this particular case to
**100x improvement** - and properly collecting and dealing with bound function type feedback.

I hope that this will in particular help web sites and web apps using [React](https://facebook.github.io/react), because React makes heavy
use of [Function.prototype.bind](http://tc39.github.io/ecma262/#sec-function.prototype.bind). But for React we will also need to look into
the performance of Function.prototype.bind itself and not only the throughput of bound functions, in order to reduce latency and startup
time.
