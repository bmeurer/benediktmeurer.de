---
layout: post
title: "JavaScript engine fundamentals: optimizing prototypes"
---

This article describes some key fundamentals that are common to all JavaScript engines — and not just [V8](https://twitter.com/v8js), the engine the authors ([Mathias](https://twitter.com/mathias) and [Benedikt](https://twitter.com/bmeurer)) work on. As a JavaScript developer, having a deeper understanding of how JavaScript engines work helps you reason about the performance characteristics of your code.

[Previously](https://mathiasbynens.be/notes/shapes-ics), we discussed how JavaScript engines optimize object and array access through the use of Shapes and Inline Caches. This article explains optimization pipeline trade-offs and describes how engines speed up accesses to prototype properties.

*This article was originally published on [Mathias' blog](https://mathiasbynens.be/notes/prototypes), co-authored by [Mathias Bynens](https://twitter.com/mathias).*

**Note:** If you prefer watching a presentation over reading articles, then enjoy the video below! If not, skip the video and read on.

<figure>
  <iframe src="https://www.youtube.com/embed/IFWulQnM5E0" width="100%" height="360"></iframe>
</figure>

## Optimization tiers and execution trade-offs

[Our previous article](https://mathiasbynens.be/notes/shapes-ics) discussed how modern JavaScript engines all have the same overall pipeline:

![To execute JavaScript, engines use an interpreter and one or more optimization tiers](/images/2018/js-engine-pipeline-20180816.svg "To execute JavaScript, engines use an interpreter and one or more optimization tiers")

We also pointed out that although the high-level pipeline is similar between engines, there are often differences in the optimization pipeline. Why is that? **Why do some engines have more optimization tiers than others?** It turns out there is a trade-off between quickly getting code to run, or taking some more time but eventually running the code with optimal performance.

![Tradeoff between startup and execution speed](/images/2018/tradeoff-startup-speed-20180816.svg "Tradeoff between startup and execution speed")

An interpreter can produce bytecode quickly, but bytecode is generally not very efficient. An optimizing compiler on the other hand takes a little longer, but eventually produces much more efficient machine code.

This is exactly the model that V8 uses. V8's interpreter is called Ignition, and it's the fastest interpreter of all the engines (in terms of raw bytecode execution speed). V8's optimizing compiler is named TurboFan, and it eventually generates highly-optimized machine code.

![Tradeoff between startup and execution speed in V8](/images/2018/tradeoff-startup-speed-v8-20180816.svg "Tradeoff between startup and execution speed in V8")

This trade-off between startup latency and execution speed is the reason why some JavaScript engines choose to add optimization tiers in between. For example, SpiderMonkey adds a Baseline tier in between the interpreter and their full IonMonkey optimizing compiler:

![Tradeoff between startup and execution speed in SpiderMonkey](/images/2018/tradeoff-startup-speed-spidermonkey-20180816.svg "Tradeoff between startup and execution speed in SpiderMonkey")

nterpreter generates bytecode quickly, but the bytecode executes relatively slowly. Baseline takes a little longer to generate code, but it offers better run-time performance. And finally, the IonMonkey optimizing compiler takes the longest to produce machine code, but that code can run very efficiently.

Let's take a look at a concrete example and see how the pipelines in the different engines deal with it. Here’s some code that gets repeated often, in a hot loop.

```js
let result = 0;
for (let i = 0; i < 4242424242; ++i) {
  result += i;
}
console.log(result);
```

In V8 it starts running the bytecode in the Ignition interpreter. At some point the engine determines that the code is *hot* and starts up the TurboFan frontend, which is the part of TurboFan that deals with integrating profiling data and constructing a basic machine representation of the code. This is then sent to the TurboFan optimizer on a different thread for further improvements of the code.

![Overview of the V8 pipeline](/images/2018/pipeline-detail-v8-20180816.svg "Overview of the V8 pipeline")

While the optimizer is running, V8 continues executing the bytecode in Ignition. At some point the optimizer is done and we have executable machine code, and the execution can continue with that.

The SpiderMonkey engine also starts running the bytecode in the interpreter. But it has the additional Baseline tier, which means hot code is first sent to Baseline. The Baseline compiler generates Baseline code on the main thread and continues execution once ready.

![Overview of the SpiderMonkey pipeline](/images/2018/pipeline-detail-spidermonkey-20180816.svg "Overview of the SpiderMonkey pipeline")

If Baseline code is run for a while, SpiderMonkey eventually fires up the IonMonkey frontend, and kicks off the optimizer — very similarly to V8. It keeps running in Baseline while IonMonkey is optimizing. Finally, when the optimizer is done, the optimized code is executed instead of the Baseline code.

Chakra's architecture is very similar to SpiderMonkey's, but Chakra tries to run more things concurrently to avoid blocking the main thread. Instead of running any part of the compiler on the main thread, Chakra copies out the bytecode and the profiling data that the compiler likely needs and sends it to a dedicated compiler process.

![Overview of the Chakra pipeline](/images/2018/pipeline-detail-chakra-20180816.svg "Overview of the Chakra pipeline")

When the generated code is ready, the engine starts to run this SimpleJIT code instead of the bytecode. The same goes for the FullJIT. The benefit of this approach is that the pause times where the copy happens are usually much shorter compared to running the full compiler (frontend). But the downside of this approach is that the *copy heuristic* might miss some information that would be required for a certain optimization, so it's trading code quality for latency to some extent.

In JavaScriptCore, all optimizing compilers run **fully concurrent** with the main JavaScript execution; there's no copy phase! Instead, the main thread merely triggers compilation jobs on another thread. The compilers then use a complicated locking scheme to access profiling data from the main thread.

![Overview of the JavaScriptCore pipeline](/images/2018/pipeline-detail-javascriptcore-20180816.svg "Overview of the JavaScriptCore pipeline")

The advantage of this approach is that it reduces the jank caused by JavaScript optimization on the main thread. The downside is that it requires dealing with complex multithreading issues and paying some locking cost for various operations.

We've talked about the trade-off between generating code quickly like with an interpreter, or generating quick code with an optimizing compiler. But there is another trade-off: **memory usage**! To illustrate that, here's a simple JavaScript program that adds two numbers together.

```js
function add(x, y) {
  return x + y;
}

add(1, 2);
```

Let's take a look at the bytecode we generate for the `add` function using the Ignition interpreter in V8.

```
StackCheck
Ldar a1
Add a0, [0]
Return
```

Don’t worry about the exact bytecode — you don’t really need to read it. The point is that it’s **just four instructions**!

When the code becomes hot, TurboFan generates the following highly-optimized machine code:

```
leaq rcx,[rip+0x0]
movq rcx,[rcx-0x37]
testb [rcx+0xf],0x1
jnz CompileLazyDeoptimizedCode
push rbp
movq rbp,rsp
push rsi
push rdi
cmpq rsp,[r13+0xe88]
jna StackOverflow
movq rax,[rbp+0x18]
test al,0x1
jnz Deoptimize
movq rbx,[rbp+0x10]
testb rbx,0x1
jnz Deoptimize
movq rdx,rbx
shrq rdx, 32
movq rcx,rax
shrq rcx, 32
addl rdx,rcx
jo Deoptimize
shlq rdx, 32
movq rax,rdx
movq rsp,rbp
pop rbp
ret 0x18
```

That's a **lot of code**, especially when compared to the four instructions we had in the bytecode! In general, bytecode tends to be a lot more compact than machine code, especially optimized machine code. On the other hand, bytecode needs an interpreter to run, whereas the optimized code can be executed directly by the processor.

This is one of the main reasons why JavaScript engines don't just *"optimize everything"*. As we saw earlier, generating optimized machine code takes a long time, and on top of that, we just learned that **optimized machine code also requires more memory**.

![Optimization level vs memory usage](/images/2018/tradeoff-memory-20180816.svg "Optimization level vs memory usage")

**Summary:** The reason JS engines have different optimization tiers is because of a fundamental trade-off between *generating code quickly* like with an interpreter, or *generating quick code* with an optimizing compiler. It's a scale, and adding more optimization tiers allows you to make more fine-grained decisions at the cost of additional complexity and overhead. In addition, there's a trade-off between the optimization level and the memory usage of the generated code. This is why JS engines try to optimize only *hot* functions.

## Optimizing prototype property access

[Our previous article](https://mathiasbynens.be/notes/shapes-ics#optimizing-property-access) explained how JavaScript engines optimize object property loads using Shapes and Inline Caches. To recap, engines store the `Shape` of the object separately from the object's values.

![Object shapes](/images/2018/shape-2-20180816.svg "Object shapes")

Shapes enable an optimization called _Inline Caches_ or _ICs_ for short. Combined, Shapes and ICs can speed up repeated property accesses from the same place in your code. 

![Shapes and Inline Caches](/images/2018/ic-4-20180816.svg "Shapes and Inline Caches")

### Classes and prototype-based programming
Now that we know how to make property access fast on JavaScript objects, let's look at one of the more recent additions to JavaScript: classes. Here's what the JavaScript class syntax looks like:

```js
class Bar {
  constructor(x) {
    this.x = x;
  }
  getX() {
    return this.x;
  }
}
```

Although this appears to be a new concept in JavaScript, it's merely syntactic sugar for prototype-based programming that has been used in JavaScript forever:

```js
function Bar(x) {
  this.x = x;
}

Bar.prototype.getX = function getX() {
  return this.x;
};
```

Here, we assign a `getX` property on the `Bar.prototype` object. This works in exactly the same way as with any other object, because **prototypes are just objects in JavaScript**! In prototype-based programming languages like JavaScript, methods are shared via the prototypes, while fields are stored on the actual instances.

Let’s zoom in on what happens behind the scenes when we create a new instance of `Bar` called `foo`. 

```js
const foo = new Bar(true);
```

The instance created from running this code has a shape with a single property `'x'`. The prototype of `foo` is the `Bar.prototype` that belongs to the class `Bar`.

![Classes and Shapes Part 1](/images/2018/class-shape-1-20180816.svg "Classes and Shapes Part 1")

This `Bar.prototype` has a shape of its own, containing a single property `'getX'` whose value is the function `getX` that just returns `this.x` when called. The prototype of `Bar.prototype` is the `Object.prototype` that's part of the JavaScript language. The `Object.prototype` is the root of the prototype tree and thus its prototype is `null`.

![Classes and Shapes Part 2](/images/2018/class-shape-2-20180816.svg "Classes and Shapes Part 2")

If you create another instance of the same class, both instances share the object shape, as we discussed earlier. Both instances point to the same `Bar.prototype` object.

### Prototype property access

Ok, so now we know what happens when we define a class and we create a new instance. But what happens if we call a method on an instance, like we're doing here?

```js
class Bar {
  constructor(x) { this.x = x; }
  getX() { return this.x; }
}

const foo = new Bar(true);
const x = foo.getX();
//        ^^^^^^^^^^
```

You can think of any method call as two individual steps:

```js
const x = foo.getX();

// is actually two steps:

const $getX = foo.getX;
const x = $getX.call(foo);
```

Step 1 is to load the method, which is just a property on the prototype (whose value happens to be a function). Step 2 is to call the function with the instance as the `this` value. Let's walk through that first step, which is loading the method `getX` from the instance `foo`.

![Method load](/images/2018/method-load-20180816.svg "Method load")

The engine starts at the `foo` instance and realizes there is no `'getX'` property on `foo`s shape, so it has to walk up the prototype chain for it. We get to `Bar.prototype`, look at its prototype shape, and see that it has the `'getX'` property at offset `0`. We look up the value at this offset in `Bar.prototype` and find the `JSFunction` `getX` that we were looking for. And that’s it!

JavaScript's flexibility makes it possible to mutate prototype chain links, for example:

```js
const foo = new Bar(true);
foo.getX();
// → true

Object.setPrototypeOf(foo, null);
foo.getX();
// Uncaught TypeError: foo.getX is not a function
```

In this example, we call `foo.getX()` twice, but each time it has a completely different meaning and result. This is why, although prototypes are just objects in JavaScript, speeding up prototype property access is even more challenging for JavaScript engines than speeding up _own_ property access on regular objects. 

Looking at programs in the wild, loading prototype properties is a very frequent operation: it happens every time you call a method!

```js
class Bar {
  constructor(x) { this.x = x; }
  getX() { return this.x; }
}

const foo = new Bar(true);
const x = foo.getX();
```

Earlier, we discussed how engines optimize loading regular, _own_ properties through the use of Shapes and Inline Caches. How can we optimize repeated loads of prototype properties on objects with similar shapes? We saw above how the property load happens.

![Prototype load checks](/images/2018/prototype-load-checks-1-20180816.svg "Prototype load checks")

n order to make that fast for repeated loads in this particular case, we need to know these three things:

The shape of `foo` does not contain `'getX'` and did not change. This means no one altered the object `foo` by adding or deleting a property, or by changing one of the property attributes.
The prototype of `foo` is still the initial `Bar.prototype`. This means no one changed `foo`s prototype by using `Object.setPrototypeOf()` or by assigning to the special `__proto__` property.
The shape of `Bar.prototype` contains `'getX'` and did not change. This means no one altered the `Bar.prototype` by adding or deleting a property, or by changing one of the property attributes.

In the general case, that means we have to perform 1 check on the instance itself, plus 2 checks for each prototype up to the prototype which holds the property we're looking for. `1+2N`checks (where `N` is the number of prototypes involved) may not sound too bad for this case, because the prototype chain is relatively shallow. But oftentimes engines have to deal with much longer prototype chains, like in the case of common DOM classes. Here’s an example of that:

```js
const anchor = document.createElement('a');
// → HTMLAnchorElement

const title = anchor.getAttribute('title');
```

We have an `HTMLAnchorElement` and we call the `getAttribute()` method on it. Looking at the prototype chain of a simple anchor element, we can see that there are already 6 prototypes involved. And a lot of the interesting DOM methods are not on the direct prototypes, but even higher up in the chain.

![HTMLAnchorElement prototype chain](/images/2018/anchor-prototype-chain-20180816.svg "HTMLAnchorElement prototype chain")

The `getAttribute()` method is found on the `Element.prototype`. That means each time we call `anchor.getAttribute()`, the JavaScript engine needs to

1. check that `'getAttribute'` is not on the `anchor` object itself,
2. check that the direct prototype is `HTMLAnchorElement.prototype`,
3. assert absence of `'getAttribute'` there,
4. check that the next prototype is `HTMLElement.prototype`,
5. assert absence of `'getAttribute'` there as well,
6. eventually check that the next prototype is `Element.prototype`,
7. and that `'getAttribute'` is present there.

That’s a total of 7 checks! Since this kind of code is pretty common on the web, engines apply tricks to reduce the number of checks necessary for property loads on prototypes.

Going back to the earlier example, we perform a total of 3 checks when accessing `'getX'` on `foo`:

```js
class Bar {
  constructor(x) { this.x = x; }
  getX() { return this.x; }
}

const foo = new Bar(true);
const $getX = foo.getX;
```

For each object involved up until the prototype that carries the property, we need to do shape checks for absence. It'd be nice if we could reduce the number of checks by folding the prototype check into the absence check. And that's essentially what engines do with a simple trick: **instead of storing the prototype link on the instance itself, engines store it on the `Shape`**.

![Improved prototype load checks](/images/2018/prototype-load-checks-2-20180816.svg "Improved prototype load checks")

Each shape points to the prototype. This also means that every time the prototype of `foo` changes, the engine transitions to a new shape. Now we only need to check the shape of an object to both assert absence of certain properties and also guard the prototype link.

With this approach, we can reduce the number of checks required from `1+2N` to `1+N` for faster property access on prototypes. But that's still quite expensive, since it's still linear in the length of the prototype chain. Engines implement different tricks to further reduce this to a constant number of checks, especially for subsequent executions of the same property loads.

### Validity cells

V8 treats prototype shapes specially for this purpose. Each prototype has a unique shape, that is not shared with any other objects (specifically not with other prototypes) and each of these prototype shapes has a special `ValidityCell` associated with it.

![ValidityCell](/images/2018/validitycell-20180816.svg "ValidityCell")

This `ValidityCell` is invalidated whenever someone changes the associated prototype or any prototype above it. Let’s take a look at how this works exactly.

To speed up subsequent loads from prototypes, V8 puts an Inline Cache in place, with four fields:

![ValidityCell in ICs](/images/2018/ic-validitycell-20180816.svg "ValidityCell in ICs")

When warming up the inline cache during the first run of this code, V8 remembers the offset at which the property was found in the prototype, the prototype on which the property was found (`Bar.prototype` in this example), the shape of the instance (the shape of `foo` in this case), and also the link to the current ValidityCell of the **immediate prototype** that is linked to from the instance shape (which also happens to be `Bar.prototype` in this case).

The next time the Inline Cache is hit, the engine has to check the shape of the instance and the `ValidityCell`. If it's still valid, the engine can reach out directly to the `Offset` on the `Prototype`, skipping the additional lookups.

![ValidityCell invalidation](/images/2018/validitycell-invalid-20180816.svg "ValidityCell invalidation")

When the prototype is changed, a new shape is allocated and the previous `ValidityCell` is invalidated. So the Inline Cache misses the next time it's executed, resulting in worse performance.

Going back to the DOM element example from before, this means that any change to e.g. `Object.prototype` would not just invalidate Inline Caches for `Object.prototype` itself, but also for any prototype below including `EventTarget.prototype`, `Node.prototype`, `Element.prototype` and so on, all the way down until `HTMLAnchorElement.prototype`.

![Prototype chain ValidityCells](/images/2018/prototype-chain-validitycells-20180816.svg "Prototype chain ValidityCells")

Effectively, modifying `Object.prototype` while running your code means throwing performance out the window. **Don't do it!**

Let's explore this a bit more with a concrete example: Say we have our class `Bar`, and we have a function `loadX` that calls a method on `Bar` objects. We call this `loadX` function a few times with instances of the same class.

```js
class Bar { /* … */ }

function loadX(bar) {
  return bar.getX(); // IC for 'getX' on Bar instances
}

loadX(new Bar(true));
loadX(new Bar(false));
// IC in loadX now links ValidityCell for Bar.prototype.

Object.prototype.newMethod = y => y;
// The ValidityCell in the loadX IC is invalid
// now, because Object.prototype changed.
```

The inline cache in `loadX` now points to the `ValidityCell` for `Bar.prototype`. If you then do something like mutate the `Object.prototype` — which is the root of all prototypes in JavaScript — the `ValidityCell` becomes invalid, and the existing Inline Caches miss the next time they're hit, resulting in worse performance.

Mutating `Object.prototype` is always a bad idea, as it invalidates any Inline Caches for prototype loads that the engine had put up until that point. Here's another example of what NOT to do:

```js
Object.prototype.foo = function() { /* … */ };

// Run critical code:
someObject.foo();
// End critical code.

delete Object.prototype.foo;
```

We extend `Object.prototype`, which invalidates any prototype Inline Caches the engine put in place up until that point. Then we run some code that uses the new prototype method. The engine has to start over from scratch and set up new Inline Caches for any prototype property accesses. And then finally, we *"clean up after ourselves"* and remove the prototype method we added earlier.

Cleaning up sounds like a good idea, right? Well actually, in this case it makes a bad situation even worse! Deleting the property modifies `Object.prototype`, so all the Inline Caches are invalidated all over again and the engine has to start from scratch once again.

**Summary:** Although prototypes are just objects, they are treated specially by JavaScript engines to optimize the performance of method lookups on prototypes. Leave your prototypes alone! Or if you really need to touch prototypes, then do it before other code runs, so that you at least don't invalidate all the optimizations in the engine while your code is running.

## Take-aways

We’ve learned how JavaScript engines store objects and classes, and how `Shape`s, Inline Caches, and `ValidityCell`s help to optimize prototype operations. Based on this knowledge, we identified a practical JavaScript coding tip that can help boost performance: **don't mess with prototypes** (or if you really, really need to, then at least do it before other code runs).

## Translations

 - [Chinese](https://hijiangtao.github.io/2018/08/21/Prototypes/)
 - [Korean](https://shlrur.github.io/javascripts/javascript-engine-fundamentals-optimizing-prototypes/)
