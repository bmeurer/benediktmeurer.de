---
layout: post
title: Connecting the dots
---

The last months have been a hectic time for me. I was hosting my first intern [Juliana Franco](https://twitter.com/jupvfranco)
at Google working on the Deoptimizer during her [*internship on lazyiness*](https://twitter.com/v8js/status/915473224187760640).
Then I was diagnosed with articular gout and almost couldn't walk for a week. And we finally moved into our new house with a lot
of help from my awesome colleagues on the V8 team. On the [Node.js](https://nodejs.org) front, I became the [tech lead of Node
performance](https://twitter.com/bmeurer/status/896996151731343361) in the V8 team, joined the [Node.js benchmarking working
group](https://github.com/nodejs/benchmarking/commit/681b4e3570fdc3658db4fab7952ca2934d7d6f14), and I am now officially a
[Node.js collaborator](https://twitter.com/trott/status/913640867600019456). But I also had some time to close gaps in V8
performance now that [Ignition and TurboFan](https://v8project.blogspot.de/2017/05/launching-ignition-and-turbofan.html)
finally launched [everywhere](https://medium.com/the-node-js-collection/node-js-8-3-0-is-now-available-shipping-with-the-ignition-turbofan-execution-pipeline-aa5875ad3367).

So today I'll give an overview of what I've done in V8 land in the last month, which is also a sneak preview of what's going
to change performance-wise in V8 6.3 (which will ship as part of Chrome 63 and probably Node 9 at some point). Fortunately
most of the changes were straight-forward at this point, because most of the infrastructure for the optimizations is in
place already and we only need to connect the dots now.

I'm going to use V8 version 5.8 (which is the last version before we switched to Ignition and TurboFan in Chrome),
6.1 (which is the current stable version in Chrome and also in Node 8) and 6.3 (which is the current development version)
for the performance comparisons.


# An internship on laziness

As mentioned above this was the first time I hosted an intern at Google. It sure comes with a lot of work and some
additional responsibilities, but it was super exciting. [Juliana](https://twitter.com/jupvfranco) was an awesome
intern. I have to admit that the area that she was working on ([lazy deoptimization without code patching](https://goo.gl/N7hwEp)
and [lazy unlinking of deoptimized functions](https://v8.dev/blog/lazy-unlinking)) is not
my main area of expertise, so I had to rely a lot on my colleagues [Jaroslav Sevcik](https://twitter.com/jarinsev)
and [Michael Starzinger](https://twitter.com/starzi) to help her out. But the end result is just amazing, especially
getting rid of the weakly linked list of all closures in V8 is a major accomplishment.

![Octane/Early Boyer](/images/2017/jupvfranco-20171005.png)

So I'd like to use this opportunity here to say: *Thank you, [Juliana](https://twitter.com/jupvfranco), for spending
the summer with us, it was awesome to have you as an intern!*


# Object constructor calls in webpack bundles

I already wrote a detailed [article](/2017/08/31/object-constructor-calls-in-webpack-bundles/) about this topic. To summarize,
[webpack](https://webpack.js.org/) v3 generates code the following bundled code

```js
var m = __webpack_require__(1);

Object(m.foo)(1, 2);  // <- called without this (undefined/global object)
```

for

```js
import foo from "module";

foo(1, 2);  // <- called without this (undefined/global object)
```

essentially wrapping the target in the
[`Object` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
to make sure the callee get's passed either `undefined` if
it's in strict mode or the global object if it's a sloppy mode function. By [teaching TurboFan about the `Object`
constructor](https://chromium-review.googlesource.com/c/v8/v8/+/643868) we were able to close the performance gap
and make these calls as fast as direct calls or indirect calls via the
[`Function.prototype.call`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
builtin.

![Object constructor calls performance results](/images/2017/results-20170831.svg)

What was awesome about this change is that it went [viral](https://twitter.com/v8js/status/903150329973403648) and soon
all major JavaScript engines, including [SpiderMonkey](https://twitter.com/SpiderMonkeyJS/status/903572265379520512),
[JavaScriptCore](https://twitter.com/Constellation/status/903841886367997952) and
[ChakraCore](https://twitter.com/KuXMLP/status/904011957962915841), will support this optimization.

![Collaboration](/images/2017/collaboration-20171005.png)


# Restoring `for..in` peak performance

This was also already described in a [detailed blog post](/2017/09/07/restoring-for-in-peak-performance/). The **TL;DR**
is that when we [launched Ignition and TurboFan](https://v8.dev/blog/launching-ignition-and-turbofan),
we did so with a couple of regressions that we'd need to address once the dust settles. One of the major performance hits
was a **4-5x** regression in `for..in` peak performance as noticed in [Get ready: A new V8 is coming, Node.js performance is
changing](https://www.nearform.com/blog/node-js-is-getting-a-new-v8-with-turbofan/).

```js
var obj = {
  x: 1,
  y: 1,
  z: 1
}
var total = 0
for (var prop in obj) {
  if (obj.hasOwnProperty(prop)) {
    total += obj[prop]
  }
}
```

We managed to not only recover the regression on this micro-benchmark, but even performance compared to previous
Node versions. So expect a huge performance boost in Node 9 (might also end up in Node 8 if it turns out to be
fine to upgrade V8 during LTS cycles).

![for..in peak performance](/images/2017/nearform-after-20170907.png)

Also worth noting, that despite having regressed from Node 7 to Node 8, the `for..in` peak performance in the
upcoming LTS (Node 8) still improves compared to the previous LTS (Node 6).


# Optimize Object constructor subclassing

Subclassing [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) explicitly
was about **3-4x** times slower (upon instance creation) than just skipping the `extends` clause completely. While it didn't
seem to be useful to write

```js
class A extends Object { ... }
```

instead of just

```js
class A { ... }
```

where the only observable difference will be the prototype chain of the constructor, there's the case of *class factories*.
When you use class factories to stamp out base classes, i.e. as mentioned
[here](https://twitter.com/FremyCompany/status/905977048006402048) and
[here](https://twitter.com/rauschma/status/905914341962252291),

```js
const Factory = BaseClass =>
  class A extends BaseClass { ... };
const MyObject = Factory(Object);
```

where code will implicitly extend the
[`Object` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object).
Unfortunately V8 didn't do a good job at optimizing this use case, and in particular TurboFan didn't know about
it, so we had to [introduce some magic](https://chromium-review.googlesource.com/657019) to recognize the case
where the `Object` constructor is being used as the base class, so that TurboFan can still fully inline the
object instantiation.

![Object constructor subclassing performance](/images/2017/object-constructor-subclassing-20171005.svg)

Compared to Chrome 58, which is latest version shipping with the old Crankshaft based optimization pipeline,
the performance of subclassing `Object` improved by **5.4x**.


# Fast-path for `TypedArray`s in `Function.prototype.apply`

I'm also actively trying to address long-standing issues. One of these was a [report from 2012](http://crbug.com/v8/2435)
titled "`String.fromcharCode.apply(undefined, uint8Array)` is super-slow", which discovered that using
[`Function.prototype.apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
with `TypedArray`s is embarrassingly slow in V8. This is specifically bad, since there's a nice use case in combination with
[`String.fromCharCode`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode)
to construct Strings from character code sequences encoded in `Uint8Array`s or `Uint16Array`s.

```js
// convert a typed array to a js string
function ar2str(uint16arr) {
  // break the computation into smaller arrays to avoid browser limits on array
  // size for .apply() call
  var res = [], i = 0, len = uint16arr.length, MAX_ELEMENTS_PER_CALL = 100000;
  while (i < len) {
    res.push(String.fromCharCode.apply(
        null, uint16arr.subarray(i, i += MAX_ELEMENTS_PER_CALL)));
  }
  return res.join('');
}
```

It turned out to be fairly straight-forward to just add a [fast-path for `TypedArray`s to the `%CreateListFromArrayLike`
C++ runtime function](https://chromium-review.googlesource.com/657405), which is used by `Function.prototype.apply` under the hood.

![CreateListFromArrayLike performance](/images/2017/create-list-from-array-like-20171005.svg)

So it's a **2.2x** to **3.4x** improvement compared to Chrome 58, and there's probably still some room for improvement
in the future. The same optimization was also later [ported to
SpiderMonkey](https://twitter.com/SpiderMonkeyJS/status/907950258973528064), where they observed similar speed-ups.

[![String.fromCharCode with Function.prototype.apply in SpiderMonkey](/images/2017/spidermonkey-string-fromcharcode-20171005.png)](https://twitter.com/SpiderMonkeyJS/status/907950258973528064)


# Optimize `Array.prototype.push` with multiple parameters

Earlier last month, SpiderMonkey's [André Bargull](https://twitter.com/abargull)
[discovered](https://bugzilla.mozilla.org/show_bug.cgi?id=1386001) that Firefox often missed opportunities to inline
calls to [`Array.prototype.push`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
into optimized code, especially visible on the [Speedometer](http://browserbench.org/Speedometer) Ember test and the
[`six-speed-spread-literal-es5`](https://arewefastyet.com/#machine=29&view=single&suite=six-speed&subtest=spread-literal-es5)
benchmark:

[![SpiderMonkey six-speed-spread-literal-es5 finding](/images/2017/spidermonkey-six-speed-spread-literal-es5-20171005.png)](https://twitter.com/SpiderMonkeyJS/status/906528938452832257)

A [similar observation](https://bugs.webkit.org/show_bug.cgi?id=175823) had already been made by the JavaScriptCore folks.
And it turned out that we were also missing this optimization in V8. So I took the idea from SpiderMonkey and [ported it
to TurboFan](https://chromium-review.googlesource.com/657582).

![Array.prototype.push performance](/images/2017/array-push-20171005.svg)

This essentially removes the weird performance cliff when going from single argument to multiple arguments in a single
call to `Array.prototype.push`. And we also closed the gap on the
[`six-speed-spread-literal-es5`](https://arewefastyet.com/#machine=29&view=single&suite=six-speed&subtest=spread-literal-es5)
benchmark.

[![V8 six-speed-spread-literal-es5 results](/images/2017/v8-six-speed-spread-literal-es5-20171005.png)](https://twitter.com/bmeurer/status/907213466800414721)


# Improved constant-folding

We also realized that TurboFan was missing several opportunities for constant-folding, specifically the
[`six-speed-templatestring-es5`](https://arewefastyet.com/#machine=29&view=single&suite=six-speed&subtest=templatestring-es5) and
[`six-speed-templatestring-es6`](https://arewefastyet.com/#machine=29&view=single&suite=six-speed&subtest=templatestring-es6)
made it clear that we weren't doing a good job there (yes, those are micro-benchmarks and the iteration count chosen by
[arewefastyet](http://arewefastyet.com) is insane, so the impact on real-world will not be 20x unless your application
doesn't do anything else). So we connected a [couple](https://chromium-review.googlesource.com/662757)
[more](https://chromium-review.googlesource.com/663358) [dots](https://chromium-review.googlesource.com/663181) and
observed some massive speed-ups on these benchmarks.

![six-speed-templatestring-es5](/images/2017/six-speed-templatestring-es5-20171005.png)
![six-speed-templatestring-es6](/images/2017/six-speed-templatestring-es6-20171005.png)


# Optimize tagged templates

[Tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) are one of the coolest
features introduced with [ES2015](https://www.ecma-international.org/ecma-262/6.0/) - if you ask me 😛. I specifically love
the [Computing tag functions for ES6 template literals](http://2ality.com/2016/11/computing-tag-functions.html) idea, i.e.:

```js
/**
 * Tag function that returns a string that conforms
 * to the normal (“cooked”) interpretation of
 * template literals.
 * `String.raw` is similar, but follows the “raw”
 * interpretation.
 */
function cook(strs, ...substs) {
    return substs.reduce(
        (prev,cur,i) => prev+cur+strs[i+1],
        strs[0]
    );
}

function repeat(times) {
    return function (...args) {
        return cook(...args).repeat(times);
    };
}

repeat(3)`abc${3+1}`;  // produces "abc4abc4abc4"
```

Here the language specification even
[requires implementations to cache the so-called *TemplateObject*](https://tc39.github.io/ecma262/#sec-gettemplateobject) to
actively encourage constant-folding and avoid recomputation
when going to optimized code. Unfortunately we didn't really take advantage of that so far. So I [started teaching both Ignition
and TurboFan about *template objects*](https://chromium-review.googlesource.com/677462), which brought the ES6 implementation
on par with the Babel transpiled code. Once that was done, we [looked into constant-folding sealed
properties](https://chromium-review.googlesource.com/677603) consistently, i.e. own properties of objects that were either
frozen via [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
or sealed via [`Object.seal`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal).

![Tagged templates performance](/images/2017/template-string-tag-20171005.svg)

Together these changes yielded a massive performance improvement of up to **23x** and helped us to boost the
[`six-speed-templatestringtag-es6`](https://arewefastyet.com/#machine=29&view=single&suite=six-speed&subtest=templatestringtag-es6)
benchmark even further (keep in mind that this is a micro-benchmark).

[![Performance of tagged templates is now on par with transpiled code](/images/2017/six-speed-templatestring-tag-es6-20171005.png)](https://twitter.com/mathias/status/912223187005509632)


# Properly optimize literals in inlined functions

Then I stumbled upon a [bug in TurboFan](https://bugs.chromium.org/p/v8/issues/detail?id=6856) where it would not always
optimize array, object or regular expression literals properly when they occur in inlined functions. So for example, let's
say you have code like this

```js
function foo() {
  function bar() { return { x: 1 }; };
  return bar().x;
}
```

then `bar` will likely be inlined into `foo` during optimization, but the literal `{x:1}` will not be turned into an
inline allocation, and instead call out to a generic code stub - the `FastCloneShallowObject` builtin - which is *a lot
slower* than an inlined allocation, that can also be escape analyzed away. Interestingly, changing the code slightly to

```js
function bar() {
  return { x: 1 };
}
function foo() {
  return bar().x;
}
```

so that TurboFan inlines based on the concrete closure, `JSFunction` in V8 speak, we don't emit any code for the literal,
but just return `1` as expected. Turns out that this was just a left over from a previous refactoring (when we moved the
literal boilerplates to the [`FeedbackVector`](https://www.youtube.com/watch?v=u7zRSm8jzvA)). So finishing the refactoring
and [always specializing literals](https://chromium-review.googlesource.com/680656) like any other feedback fixes this
fancy performance cliff, yielding a roughly **3x** to **4x** performance improvement compared to Chrome 61, and almost an
**8x** improvement compared to Chrome 58 (which didn't get the inlining right for this case), on the micro-benchmarks from
the [tracking bug](https://bugs.chromium.org/p/v8/issues/detail?id=6856#c1).

![Inlined literals performance](/images/2017/inlined-literals-20171005.svg)


# Optimize `ArrayBuffer` view checks

Last week I was dragged into a conversion regarding [nodejs/node#15663](https://github.com/nodejs/node/pull/15663) and
what could be done on the V8 side to help improve performance of these predicates. It turned out that all the relevant
builtins for either checking whether something is any `ArrayBuffer` view (i.e. either a `TypedArray` or a `DataView`),
a concrete `TypedArray` like `Uint8Array`, or just any `TypedArray`, weren't really optimized in V8 (neither the baseline
implementation nor the treatment inside TurboFan). Specifically to check for whether something is a `TypedArray`, the
best (and maybe only) way to do this now is to use the
[`TypedArray.prototype[@@toStringTag]` getter](https://tc39.github.io/ecma262/#sec-get-%typedarray%.prototype-@@tostringtag),
i.e. the pattern looks like this (as found in
[`lib/internal/util/types.js`](https://github.com/nodejs/node/blob/f547db131f527528d60c8bcc60cb43462937a794/lib/internal/util/types.js)):

```js
const ReflectApply = Reflect.apply;

function uncurryThis(func) {
  return (thisArg, ...args) => ReflectApply(func, thisArg, args);
}

const TypedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);

const TypedArrayProto_toStringTag =
    uncurryThis(
      Object.getOwnPropertyDescriptor(TypedArrayPrototype,
                                      Symbol.toStringTag).get);

function isTypedArray(value) {
  return TypedArrayProto_toStringTag(value) !== undefined;
}

function isUint8Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint8Array';
}

const isArrayBufferView = ArrayBuffer.isView
```

Now you can use `isTypedArray(x)` to check whether `x` is any `TypedArray`, and `isUint8Array(x)` to check whether
`x` is an `Uint8Array`. TurboFan was already doing a good job at `Reflect.apply` and also dealing well with the
rest parameters in `uncurryThis`. So all that was left was to optimize
[`ArrayBuffer.isView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView)
for the general check and
[`TypedArray.prototype[@@toStringTag]` getter](https://tc39.github.io/ecma262/#sec-get-%typedarray%.prototype-@@tostringtag)
for the `TypedArray` checks.

The former was straight-forward, just [adding a new `ObjectIsArrayBufferView`
predicate](https://chromium-review.googlesource.com/691660) to TurboFan and lowering calls to `ArrayBuffer.isView` to
this newly introduced predicate. The latter was a bit more involved, and required both changes to the [baseline implementation
and the TurboFan treatment](https://chromium-review.googlesource.com/695021). The fundamental idea was to use the fact
that each kind of `TypedArray` has a specific [elements kind](https://v8.dev/blog/elements-kinds),
i.e. `UINT8_ELEMENTS`, `FLOAT64_ELEMENTS`, and so on. So the implementation now simply switches on the elements kind
on the hidden class of the receiver and returns the proper String or `undefined` if it's not a `TypedArray`.

![TypedArray predicate performance](/images/2017/arraybuffer-view-checks-20171005.svg)

We observe up to **14.5x** performance improvements compared to Chrome 58.


# Miserable performance when storing booleans in typed arrays

This week's monday morning exercise. Every now and then some people ping some long-standing bugs hoping that someone would pick
them up and fix them. In this case it was the infamous [Chromium bug 287773](http://crbug.com/287773), which was originally
reported in late 2013, so more than 4 years ago. The reported problem is that storing booleans to typed arrays leads to
really bad performance in V8. I have to admit that I've been ignoring this bug for a while, since it wasn't really trivial
to fix in Crankshaft when I saw the bug for the first time, and then forgot about it. But thanks to TurboFan fixing this
bug was a [no brainer](https://chromium-review.googlesource.com/691731): We just need to update the `KEYED_STORE_IC` to
truncate `true`, `false`, `undefined` and `null` to numbers instead of sending the IC to `MEGAMORPHIC` state, and also
tell TurboFan to properly convert the right-hand side of the assignment to a number first (if it's not already a number).

![TypedArray boolean performance](/images/2017/typed-array-boolean-20171005.svg)

With this in place the performance of storing `true` or `false` to a `TypedArray` is now identical to storing integers,
compared to Chrome 61 that's a solid **70x** improvement.


# Polymorphic symbol lookup not well supported

Later that same day [Slava](http://twitter.com/mraleph) popped up with an
[issue](https://twitter.com/mraleph/status/913818343429296128) that the [Dart](https://www.dartlang.org/) folks
ran into.

[![Slava complaining on Twitter](/images/2017/slava-20171005.png)](https://twitter.com/mraleph/status/913818343429296128)

This looked suspiciously similar to [V8 issue 6367](http://crbug.com/v8/6367) that we had noticed before, but hadn't
had the time to dig into. The underlying issue is that for code like

```js
const sym = Symbol();

function foo(o) { return o[sym]; }
```

we don't deal well with the case where `o` has different hidden classes on the access to `o[sym]`. The responsible
`KEYED_LOAD_IC` would immediately go to `MEGAMORPHIC` state (read: *become generic*) when it sees more than one
hidden class for `o`. Doing the same with string names using the dot syntax, i.e.

```js
function foo(o) { return o.str; }
```

is just fine and can handle up to 4 different hidden classes for `o` until it decides to go `MEGAMORPHIC`. Interestingly
I discovered that this was not a fundamental problem, in fact most of the relevant components in V8 could already
deal with multiple hidden classes even for the `KEYED_LOAD_IC`, so it was merely a matter of [connecting the
dots](https://chromium-review.googlesource.com/695108) again (plus some [yak
shaving](https://chromium-review.googlesource.com/695307) to repair a bug that I flushed out with the initial CL) to
fix the odd performance cliff with polymorphic Symbol lookups.

![Polymorphic symbol lookup performance](/images/2017/symbol-lookup-polymorphic-20171005.svg)

![Slava saying it's fixed on Twitter](/images/2017/slava-fixed-20171005.png)

But that still didn't fully cover the case for [V8 issue 6367](http://crbug.com/v8/6367), which was about the
*clone pattern* (as discovered in the ARES6 ML benchmark):

```js
class A {
  static get [Symbol.species]() { return this; }
  clone() { return new this.constructor[Symbol.species](); }
}

class B extends A {
  static get [Symbol.species]() { return this; }
}

function foo(o) { return o.clone(); }
foo(new A());
foo(new B());
```

It turned out that while the polymorphic symbol lookup in `this.constructor[Symbol.species]` was addressed
by the [above mentioned fix](https://chromium-review.googlesource.com/695108), TurboFan would still refuse
to inline the polymorphic constructor call in `new this.constructor[Symbol.species]()`, constructing either
an instance of `A` or an instance of `B` depending on `this`. Again, it turned out that this was not something
fundamental, but just [two trivial issues](https://chromium-review.googlesource.com/700596) where some parts
of TurboFan were blocking the optimization. Removing that we got an overall **7.2x** combined performance boost
for the *clone pattern* above.


# Improve performance of `Object.is`

And one last [issue](https://bugs.chromium.org/p/v8/issues/detail?id=6882) that also [originated in Node
land](https://github.com/nodejs/node/blob/306391c/lib/util.js#L619). It turns out that `Object.is(x,-0)`
is a very elegant way to check whether an arbitrary value is minus zero, which is useful in several cases,
for example when you want to print `-0` as `"-0"` instead of `"0"` (which is what the `ToString` operation
yields otherwise).

Unfortunately [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
was previously implemented as C++ builtin, despite having all the logic for a fast
[`CodeStubAssembler`](https://v8.dev/docs/csa-builtins) based version in place already. Also
TurboFan didn't really know anything about `Object.is`, not even for the fairly simple cases where one side is statically
known to be `-0` or `NaN` (the interesting cases), or where both inputs refer to the same SSA value, which can be
constant-folded to `true` easily since `Object.is` identifies `NaN`s (in contrast to strict equality).

As mentioned we had all the building blocks in place to handle `Object.is` in a fast way, so it was merely an
exercise in [porting the existing implementation](https://chromium-review.googlesource.com/700254) and hooking
it up to TurboFan.

![Object.is performance](/images/2017/object-is-20171005.svg)

So performance of `Object.is` improved by up to **14x** since Chrome 58, and starting with Chrome 63 and/or Node 9,
it should be fine performance-wise to use `Object.is`, especially for the edge case checks, i.e. checking for `-0`
or checking for `NaN`.


# Conclusion

Congratulations, you made it through the whole blog post! 😉 No you won't get cookies, sorry...

But joking aside, these are exciting times. We had been busy with working on the long-term architectural
changes around [Ignition and TurboFan](/2017/03/01/v8-behind-the-scenes-february-edition/) - by the way
I'll be giving a talk at [JS Kongress](https://2017.js-kongress.de) this year titled ["A Tale of TurboFan:
Four years that changed V8 forever"](https://2017.js-kongress.de/sessions/tale-turbofan-four-years-changed-v8-forever/) -
and now we're finally back in a state where we can move quickly and improve performance by just closing
the gaps. I feel like JavaScript has a bright future.

![Dream](/images/2017/dream-20171005.png)
