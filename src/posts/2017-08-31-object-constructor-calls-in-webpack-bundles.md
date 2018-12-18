---
layout: post
title: Object constructor calls in webpack bundles
tags:
  - performance
  - v8
  - webpack
---

Yesterday I was pointed to [webpack#5600](https://github.com/webpack/webpack/issues/5600), which
outlines how [webpack](https://webpack.js.org) v3 generates code for calls to imported functions,
i.e. code like this

```js
import foo from "module";

foo(1, 2); // <- called without this (undefined/global object)
```

is turned into the following bundled code:

```js
var __WEBPACK_IMPORTED_MODULE_1__module__ = __webpack_require__(1);

Object(__WEBPACK_IMPORTED_MODULE_1__module__.foo)(1, 2);
// ^ called without this (undefined/global object)
```

The reason behind this is that webpack has to preserve the semantics of passing the correct
implicit receiver `this` to the function `foo`. If you'd generate code like this instead

```js
var __WEBPACK_IMPORTED_MODULE_1__module__ = __webpack_require__(1);

__WEBPACK_IMPORTED_MODULE_1__module__.foo(1, 2);
// ^ called this = __WEBPACK_IMPORTED_MODULE_1__module__
```

then the implicit receiver `this` would be bound to `__WEBPACK_IMPORTED_MODULE_1__module__`
inside `foo` instead, which doesn't match the semantics of the ESM above. There are obviously
several different ways to accomplish this, and [Tobias Koppers](https://twitter.com/wsokra)
goes [into quite some detail](https://github.com/webpack/webpack/issues/5600#issuecomment-325925287)
about what he tried so far and why he ended up using the [`Object`
constructor](https://tc39.github.io/ecma262/#sec-object-constructor) for now.

Unfortunately it turns out that the `Object` constructor still incurs some unnecessary cost
in this case, because up until now TurboFan didn't really know about it. I verified with this
simple micro-benchmark

```js
const identity = x => x;

function callDirect(o) {
  const foo = o.foo;
  return foo(1, 2, 3);
}

function callViaCall(o) {
  return o.foo.call(undefined, 1, 2, 3);
}

function callViaObject(o) {
  return Object(o.foo)(1, 2, 3);
}

function callViaIdentity(o) {
  return identity(o.foo)(1, 2, 3);
}

var TESTS = [callDirect, callViaObject, callViaCall, callViaIdentity];

class A {
  foo(x, y, z) {
    return x + y + z;
  }
}
var o = new A();
var n = 1e8;

function test(fn) {
  var result;
  for (var i = 0; i < n; ++i) result = fn(o);
  return result;
}

// Warmup.
for (var j = 0; j < TESTS.length; ++j) {
  test(TESTS[j]);
}

// Measure.
for (var j = 0; j < TESTS.length; ++j) {
  var startTime = Date.now();
  test(TESTS[j]);
  console.log(TESTS[j].name + ":", Date.now() - startTime, "ms.");
}
```

in both V8 5.8 (last version with Crankshaft) and V8 6.1 (current beta with TurboFan),
and the results match the observations made by the webpack folks:

```
$ ./d8-5.8.283.38 bench-object-constructor.js
callDirect: 598 ms.
callViaObject: 1352 ms.
callViaCall: 645 ms.
callViaIdentity: 663 ms.
```

```
$ ./d8-6.1.534.15 bench-object-constructor.js
callDirect: 560 ms.
callViaObject: 1322 ms.
callViaCall: 613 ms.
callViaIdentity: 561 ms.
```

The version using the `identity` function yields the best results (closest to the performance
of a direct call, which cannot be emitted by webpack
[currently](https://github.com/webpack/webpack/issues/5600#issuecomment-326097660)). Next is
the version using [`Function.prototype.call`](https://tc39.github.io/ecma262/#sec-function.prototype.call).
And the version using the `Object` constructor is by far the slowest, up to **2.3x** slower than
the direct call.

The reason for this is that TurboFan (and Crankshaft) inline the `identity` function in case of
`callViaIdentity`, thereby completely eliminating any additional overhead,

![callViaIdentity optimized code](/images/2017/callviaidentity-20170831.png)

but the call to the `Object` constructor is not inlined into `callViaObject`:

![callViaObject optimized code](/images/2017/callviaobject-20170831.png)

In this particular case, calling the [`Object` constructor](https://tc39.github.io/ecma262/#sec-object-constructor)
on the closure `o.foo` is a no-op, just like calling the `identity` function, as we hit the `ToObject(value)` case,

![Object constructor](/images/2017/objectconstructor-20170831.png)

and the [`ToObject` abstract operation](https://tc39.github.io/ecma262/#sec-toobject) is the
identity for JavaScript objects (and closures are regular JavaScript objects). So all that's
needed is to teach TurboFan to fold away calls like

```js
Object(value);
```

when it's able to prove that the `value` is definitely a JavaScript object (i.e. definitely
not a primitive value). This is sufficient in the [webpack case](https://github.com/webpack/webpack/issues/5600)
since the values passed to the `Object` constructor are closures loaded from module objects,
which are constant-tracked by V8 anyways, so TurboFan is able to derive that `module.foo`
is a certain constant closure. So adding some
[`Object` constructor magic](https://chromium-review.googlesource.com/c/v8/v8/+/643868)
to TurboFan addresses the performance issue

```
$ out/Release/d8 bench-object-constructor.js
callDirect: 562 ms.
callViaObject: 564 ms.
callViaCall: 615 ms.
callViaIdentity: 564 ms.
```

as can be seen by the optimized of `callViaObject`, which looks more or less identical
to the optimized machine code generated for `callViaIdentity` (see above) now

![callViaObject optimized code (new)](/images/2017/callviaobject-new-20170831.png)

and bundles generated by webpack v3 should no longer incur any unnecessary overhead due to
the use of the `Object` constructor to pass the proper implicit receiver to imported functions.

![Performance results](/images/2017/results-20170831.svg)
