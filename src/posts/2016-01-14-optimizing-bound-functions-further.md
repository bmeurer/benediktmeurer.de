---
title: Optimizing bound functions further
tags:
  - javascript
  - performance
  - v8
---

As mentioned in my previous [blog post about a new approach to Function.prototype.bind]({{ site.baseurl }}/2015/12/25/a-new-approach-to-function-prototype-bind)
there's more potential for optimizing bound functions in [V8](https://developers.google.com/v8), especially in the new optimizing compiler TurboFan. One obvious
thing here is to further reduce the overhead for calling into bound functions, which was traditionally very high.

So what usually happens when you call a bound function is you push the receiver and all the arguments onto the machine stack and call into the
[`Call` builtin](https://github.com/v8/v8/blob/master/src/x64/builtins-x64.cc#L2241), which dispatches to the
[`CallBoundFunction` builtin](https://github.com/v8/v8/blob/master/src/x64/builtins-x64.cc#L2216) since we are attempting to call a bound function.
The `CallBoundFunction` builtin then patches the receiver to the `boundThis` parameter of `Function.prototype.bind`, pushes the additional arguments
onto the stack (below the arguments that are already present), and transfers control to the `targetFunction` by tail calling back into the `Call` builtin
(these steps match the ECMAScript specification for [[[Call]] on Bound Function Exotic
Objects](http://tc39.github.io/ecma262/#sec-bound-function-exotic-objects-call-thisargument-argumentslist)).

But if you already know that you are calling a certain bound function, then these steps above are unnecessary, and you could instead push the bound
receiver plus the bound arguments directly and call to the actual target function because they may be known during compilation time (the VM collects this
information as part of the type feedback that is gathered in various places during warmup). If you call a certain bound functions very often, then this
greatly reduces the call overhead. And thanks to the new architecture in TurboFan, this also enables the compiler to inline the target function into the
caller. So I just landed a [change](https://codereview.chromium.org/1581343002) in V8 that does exactly that, and achieved an amazing speedup.

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

Looking at my `Function.prototype.bind` microbenchmark again, and running it with TurboFan (passing the `--turbo` flag to `d8` or via
`--js-flags=--turbo` to Chrome), the time goes down to 31ms, compared to the 240ms it takes with Crankshaft or 360ms with TurboFan before
my change. That's roughly another **12x improvement** compared to baseline TurboFan or **8x improvement** compared to Crankshaft (our current
shipping configuration). So that'll be an overall **400x-600x improvement** compared to before we started looking into `Function.prototype.bind`
once we ship TurboFan by default (I was actually looking into also making this available in Crankshaft, but the inlining machinery in Crankshaft
is extremely brittle and the plan is to replace Crankshaft anyway this year).
