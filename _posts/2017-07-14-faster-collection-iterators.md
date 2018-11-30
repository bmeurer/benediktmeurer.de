---
layout: post
title: Faster Collection Iterators
---

The [ECMAScript 2015 Language Specification](https://www.ecma-international.org/ecma-262/6.0/) introduced collections into
JavaScript, specifically [`Map`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map)s and
[`Set`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set)s (among others like
[`WeakMap`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)s and
[`WeakSet`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)s). These collections are
iterable via the newly introduced *iteration protocol*, which means you can use them together with language constructs
like `for-of` and spreads.

For example for `Set`s

<p><center>
  <img src="/images/2017/devtools-set-20170714.png" alt="Set iteration" />
</center></p>

and similarly for `Map`s

<p><center>
  <img src="/images/2017/devtools-map-20170714.png" alt="Map iteration" />
</center></p>

demoing various kinds of iteration. This is defined and implemented by
[Map Iterator Objects](https://www.ecma-international.org/ecma-262/6.0/#sec-map-iterator-objects) and
[Set Iterator Objects](https://www.ecma-international.org/ecma-262/6.0/#sec-set-iterator-objects).

Unfortunately these iterator objects - like the collections themselves - weren't really well optimized in
V8 so far. In fact it was so bad, that [Brian Terlson](https://twitter.com/bterlson) complained to me about
it, because he's using `Set`s to implement a custom regular expression engine (for the ECMAScript specification).
He (rightfully) noted that Chrome and Node don't have any reasonably fast way to iterate `Set`s. So it was about
 time to change that. In order to understand what's slow and why, it's important to understand
how *iteration* works. This is easiest to understand by looking at a very simple `for-of` loop:

{% highlight javascript %}
function sum(iterable) {
  let x = 0;
  for (const y of iterable) x += y;
  return x;
}
{% endhighlight %}

Running that through [Babel](http://babeljs.io) we get the following code:

{% highlight javascript %}
function sum(iterable) {
  var x = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = iterable[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var y = _step.value;
      x += y;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return x;
}
{% endhighlight %}

If you've seen one of my [recent](https://docs.google.com/presentation/d/1DKEpAIwj9grN5UQODWo54BpdJNPVSE7soWBJTeXQq9A)
[talks](https://docs.google.com/presentation/d/1wiiZeRQp8-sXDB9xXBUAGbaQaWJC84M5RNxRyQuTmhk) about ES2015 and beyond,
you'll already know that all modern JavaScript engines essentially perform the same desugaring that Babel does here
to implement `for-of` (details vary).

Ignoring the (boring) exception handling, the core of the iteration boils down to this very simple loop:

{% highlight javascript %}
function sum(iterable) {
  var x = 0;
  var iterator = iterable[Symbol.iterator]();
  for (;;) {
    var iterResult = iterator.next();
    if (iterResult.done) break;
    x += iterResult.value;
  }
  return x;
}
{% endhighlight %}

*Side note: There's a great blog post [Iterables and iterators in ECMAScript 6](http://2ality.com/2015/02/es6-iteration.html)
and a whole section [Iterables and iterators](http://exploringjs.com/es6/ch_iteration.html) in the book "Exploring
ES6" by [Axel Rauschmayer](https://twitter.com/rauschma), which provides a lot of background on the theory and the
use of iterators. I highly recommend reading those resources.*

The key to great performance for iteration is to make sure that the repeated calls to `iterator.next()` in the
loop are optimized well, and ideally completely avoid the allocation of the `iterResult` using advanced compiler
techniques like store-load propagation, escape analysis and scalar replacement of aggregates. To really shine
performance-wise, the optimizing compiler should also completely eliminate the allocation of the `iterator`
itself - the `iterable[Symbol.iterator]()` call - and operate on the backing-store of the `iterable` directly. We did this for
the `Array` and `String` iterators before, implemented by [Caitlin Potter](https://twitter.com/caitp88), the [design
document](https://docs.google.com/document/d/13z1fvRVpe_oEroplXEEX0a3WK94fhXorHjcOMsDmR-8) provides some details
of the implementation. Essentially we could use the same ideas for the collection iterators, with some simplifications,
as `Map`s and `Set`s are indeed simpler than `Array`s.

The main reason why `Set` iterators were slow, was the fact that they were implemented via a mix of self-hosted
JavaScript and C++ code. For example, the
[%SetIteratorPrototype%.next()](https://www.ecma-international.org/ecma-262/6.0/#sec-%setiteratorprototype%.next)
was implemented like this.

{% highlight javascript %}
function SetIteratorNextJS() {
  if (!IS_SET_ITERATOR(this)) {
    throw %make_type_error(kIncompatibleMethodReceiver,
                        'Set Iterator.prototype.next', this);
  }

  var value_array = [UNDEFINED, UNDEFINED];
  var result = %_CreateIterResultObject(value_array, false);
  switch (%SetIteratorNext(this, value_array)) {
    case 0:
      result.value = UNDEFINED;
      result.done = true;
      break;
    case ITERATOR_KIND_VALUES:
      result.value = value_array[0];
      break;
    case ITERATOR_KIND_ENTRIES:
      value_array[1] = value_array[0];
      break;
  }

  return result;
}
{% endhighlight %}

What this code does is essentially the following:

1. Allocate a new `value_array` with two slots initialized to `undefined`.
2. Allocate the `result` object as `{value: value_array, done: false}`.
3. Call into the C++ `%SetIteratorNext` runtime function, passing the
   iterator `this` and the `value_array` and letting it initialize
   `value_array[0]` with the next key (if there's any). This looks a
   bit odd, but was done to have `Map` and `Set` uniform (for better
   or worse...).
4. Dispatch depending on the return value of the C++ call and initialize
   the `result` appropriately.

So we definitely always allocated two objects, the `value_array` and the `result`, per iteration step, and there was no way
for the optimizing compiler (neither TurboFan nor Crankshaft) to get rid of any of those. Even worse, every iteration step
had to transition between JavaScript and C++ land. A rough visualization of how this works in case of the `sum` function
would look like this:

<p><center>
  <img src="/images/2017/set-iterator-next-js-20170714.png" alt="Old SetIteratorNextJS" />
</center></p>

In V8 the execution is always in one of two states (actually there are more, but that doesn't matter here), you're either
executing C++ code or you're executing JavaScript. Transitioning between these two states is expensive. Going from JavaScript
land to C++ land is accomplished via the so-called `CEntryStub`, which dispatches to a specific `Runtime_Something` function
in C++ (the `Runtime_SetIteratorNext` function in this example). So avoiding these transitions and the allocations for the
`value_array` and `result` objects whenever possible is the key to great performance.

The new implementation of
[%SetIteratorPrototype%.next()](https://www.ecma-international.org/ecma-262/6.0/#sec-%setiteratorprototype%.next) does exactly
that. The [baseline implementation](https://chromium-review.googlesource.com/563626) (i.e. the code you execute before the calling function becomes hot and eventually gets
optimized by TurboFan) is now fully implemented in JavaScript land, using our so-called
[`CodeStubAssembler`](https://v8.dev/docs/csa-builtins), and essentially only calls to C++ to handle
garbage collection (when available memory is exhausted) or in case of an exception. The [optimized implementation](https://chromium-review.googlesource.com/570159) fully
inlines the call to `iterator.next()` into the optimized code of the calling function, i.e. `sum` in the example above, and
leveraging advanced compiler techniques it's able to avoid allocating both the `iterator` and the `iterResult` in case of
common `for-of` loops.

## Callback based iteration

In addition to the iteration protocol, JavaScript also provides the
[`Set.prototype.forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach)
and [`Map.prototype.forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach),
which receive a `callback` that's invoked on all the items in the collection. Those were also implemented in C++ (and until
very recently with some additional self-hosted JavaScript), making the baseline performance pretty bad, because not only
do we need to transition from JavaScript to C++ land, but to handle the `callback` we need to transition back into JavaScript.

<p><center>
  <img src="/images/2017/set-iterator-foreach-20170714.png" alt="Old SetIteratorForEach" />
</center></p>

So just porting the baseline for the two `forEach` builtins to the 
[`CodeStubAssembler`](https://v8.dev/docs/csa-builtins) already allowed me to pick a couple of
low-hanging fruits here. Fully optimizing and inlining the `forEach` builtins into TurboFan optimized code requires a
bit more magic and is not yet implemented.

## Performance Improvements

Overall we improve the performance of `Map` and `Set` iteration by up to a factor of **11** from Chrome 60 to Chrome 61.

<p><center>
  <img src="/images/2017/improvements-20170714.png" alt="Performance results" />
</center></p>

I used the following simple micro-benchmark to measure the iteration overhead:

{% highlight javascript %}
const s = new Set;
const m = new Map;
for (let i = 0; i < 1e7; ++i) {
  m.set(i, i);
  s.add(i);
}

function SetForOf() {
  for (const x of s) {}
}

function SetForOfEntries() {
  for (const x of s.entries()) {}
}

function SetForEach() {
  s.forEach(function(key, key, set) {});
}

function MapForOf() {
  for (const x of m) {}
}

function MapForOfKeys() {
  for (const x of m.keys()) {}
}

function MapForOfValues() {
  for (const x of m.values()) {}
}

function MapForEach() {
  m.forEach(function(val, key, map) {});
}

const TESTS = [
    SetForOf,
    SetForOfEntries,
    SetForEach,
    MapForOf,
    MapForOfKeys,
    MapForOfValues,
    MapForEach
];

// Warmup.
for (const test of TESTS) {
  for (let i = 0; i < 10; ++i) test();
}

// Actual tests.
for (const test of TESTS) {
  console.time(test.name);
  test();
  console.timeEnd(test.name);
}
{% endhighlight %}

We still lose some performance, especially in case of entry iteration (both `SetForOfEntries` and `MapForOf`)
because our escape analysis cannot yet eliminate the key-value array allocations, and we also still lose some
performance in case of `forEach` since we don't have it working inside optimized code (i.e. inlined by TurboFan)
at this point. But all of this is fixable and part of the long-term [ES2015 and beyond performance
plan](https://docs.google.com/document/d/1EA9EbfnydAmmU_lM8R_uEMQ-U_v4l9zulePSBkeYWmY).
