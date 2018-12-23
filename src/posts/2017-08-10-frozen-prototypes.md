---
title: Frozen Prototypes
tags:
  - javascript
  - performance
  - v8
---

With the addition of [`Object.freeze`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
and [`Object.seal`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) in
[ECMAScript 5.1](http://www.ecma-international.org/ecma-262/5.1/), there's a way for developers to prevent
various kinds of mutations to objects. For example, `Object.freeze` can be used to make an object essentially
_immutable_.

```javascript
"use strict";
const obj = { a: "Hello", b: "World" };
Object.freeze(obj);
obj.a = "Hallo"; // Throws a TypeError
obj.c = "!"; // Also throws a TypeError
```

So from a developer's point of view this looks like a very useful way to guard against changes. And looking at
it naively, it also seems to offer an opportunity for the JavaScript engines to optimize, because the objects
cannot change anymore. However that's not the case in V8, at least currently, for several reasons. A lot of
this is because various parts of the engine aren't optimized for frozen / sealed objects at this point.

One particularly bad example was [reported yesterday](http://crbug.com/v8/6689): Freezing the
[`Array.prototype`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype) or
the [`Object.prototype`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype),
as for example [done](https://github.com/apache/incubator-weex/blob/702d04c4922105069f537afdb4688f808530994d/html5/shared/freeze.js#L23-L38) by [Apache weex](https://weex.incubator.apache.org), causes several of the `Array` builtins
inside V8 to miss on the fast-path and take the generic slow-path instead, which can be an order of magnitude slower.
This affects [`Array.prototype.slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice),
[`Array.prototype.splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice),
and several other builtins. Consider the following simple micro-benchmark:

```javascript
function testSplice(a) {
  for (var i = 0; i < 1e6; ++i) a = a.splice();
  return a;
}

function testSlice(a) {
  for (var i = 0; i < 1e6; ++i) a = a.slice();
  return a;
}

const TESTS = [testSplice, testSlice];

const n = 1e6;
let a = new Array(n);
for (var i = 0; i < n; ++i) a[i] = i;

for (const test of TESTS) {
  console.time(test.name);
  a = test(a);
  console.timeEnd(test.name);
}

Object.freeze(Array.prototype);

for (const test of TESTS) {
  const name = test.name + " (frozen)";
  console.time(name);
  a = test(a);
  console.timeEnd(name);
}
```

Running this on Chrome 60 (current stable channel) shows an approximately **5x** slow-down on `Array.prototype.splice`
and roughly **4x** slow-down on `Array.prototype.slice` in this particular micro-benchmark. This particular issue is
[now fixed](https://chromium-review.googlesource.com/608127) for the upcoming Chrome 62.

![Slow-down of Array#slice and Array#splice](/images/2017/freeze-slowdown-20170810.png)

The reason why `Object.freeze` on the `Array.prototype` (or the `Object.prototype`) redirects several `Array` builtins to
their slow-paths is that the fast-paths cannot deal with array elements (properties whose names are unsigned integers in
the range 0 to 4294967295) in the prototype chain, and specifically accessors on elements cannot be handled in the fast-paths.
So these builtins do a quickcheck in the beginning to see if all prototypes are regular objects (i.e. there are no
proxies in the prototype chain), and all of the prototypes have no elements.

By default neither the `Object.prototype` nor the `Array.prototype` have elements, and `Object.freeze` doesn't
add any elements. However, `Object.freeze` currently has to put the objects into `DICTIONARY_ELEMENTS` mode at
this point (for implementation reasons), which means that the object will have a different marker when it doesn't
have any elements (the `empty_slow_elements_dictionary` instead of the `empty_fixed_array` that is used for fast
elements objects). Unfortunately the helper functions used by the affected `Array` builtins only checked the
prototypes for `empty_fixed_array`, but not for `empty_slow_elements_dictionary`, so they would automatically
fall back to the generic, safe route instead of attempting the fast-path.

```diff
diff --git a/src/objects-inl.h b/src/objects-inl.h
index 010ac2e06e..68f24baf15 100644
--- a/src/objects-inl.h
+++ b/src/objects-inl.h
@@ -902,11 +902,17 @@ bool JSObject::PrototypeHasNoElements(Isolate* isolate, JSObject* object) {
   DisallowHeapAllocation no_gc;
   HeapObject* prototype = HeapObject::cast(object->map()->prototype());
   HeapObject* null = isolate->heap()->null_value();
-  HeapObject* empty = isolate->heap()->empty_fixed_array();
+  HeapObject* empty_fixed_array = isolate->heap()->empty_fixed_array();
+  HeapObject* empty_slow_element_dictionary =
+      isolate->heap()->empty_slow_element_dictionary();
   while (prototype != null) {
     Map* map = prototype->map();
     if (map->instance_type() <= LAST_CUSTOM_ELEMENTS_RECEIVER) return false;
-    if (JSObject::cast(prototype)->elements() != empty) return false;
+    HeapObject* elements = JSObject::cast(prototype)->elements();
+    if (elements != empty_fixed_array &&
+        elements != empty_slow_element_dictionary) {
+      return false;
+    }
     prototype = HeapObject::cast(map->prototype());
   }
   return true;
```

As such, the [relevant changes](https://chromium-review.googlesource.com/c/608127) to
[`JSObject::PrototypeHasNoElements`](https://github.com/v8/v8/blob/293283d55983b421fe6e246ae22d4de531f429ec/src/objects-inl.h#L901-L919) in the V8 runtime (and similarly in the `CodeStubAssembler`) were fairly straight-forward once the problem was identified.
