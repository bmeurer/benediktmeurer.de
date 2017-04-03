---
layout: post
title: "V8: Behind the Scenes (March Edition feat. I+TF launch and Declarative JavaScript)"
---

I'm again running late for the March Edition, so that might turn into some kind of pattern. The last month was pretty exciting: We finally turned on Ignition and TurboFan by default for Chrome M59. It took two attempts, but it seems to stick now. Overall it went surprisingly well, despite the complexity and impact of this change; as my site director used to put it: ["Changing from Crankshaft to TurboFan in Chrome was like changing the engine of a F1 car at 250 km/h."](https://twitter.com/holfelder/status/842473381832409093)

<p><center>
  <a href="https://twitter.com/bmeurer/status/839337377671839744">
    <img src="/images/2017/landing-20170403.jpg" alt="Turn on Ignition + TurboFan" />
  </a>
</center></p>

Note that with the switch, we also removed the `enable-v8-future` setting from `chrome://flags`, and instead added a kill switch `disable-v8-ignition-turbo` for the new configuration on Chrome M59. This kill switch has three possible settings: Default, Disabled and Enabled. If you leave it to Default, there's a certain chance that you get the old compiler pipeline even on Canary or Dev channel due to A/B testing. Set it to Disabled to ensure that you get the new pipeline, or set it to Enabled to go with Crankshaft and Full-Codegen again.

<p><center>
  <img src="/images/2017/m59-20170403.png" alt="Chrome M59" />
</center></p>

The instructions for Chrome M58 (currently in the Beta channel) didn't change, Ignition and TurboFan is still controlled by the `enable-v8-future` flag:

<p><center>
  <img src="/images/2017/m58-20170403.png" alt="Chrome M58" />
</center></p>

Turning on the new configuration by default uncovered a couple of issues that weren't known yet, so I was pretty busy helping to address those. But as far as I can tell, things look very promising now.

End of last month I gave a presentation about [TurboFan: A new code generation architecture for V8](https://docs.google.com/presentation/d/1_eLlVzcj94_G4r9j9d_Lj5HRKFnq6jgpuPJtnmIBs88) at the [Munich Node.js User Group](http://www.mnug.de) meetup, talking a bit about things that will change with the new pipeline. Most importantly turning on the new pipeline greatly reduces overall complexity of V8, and makes it easier to port to new architectures, and what's even more important from a user's perspective, it completely eliminates the need to worry about so-called *optimization killers*, since TurboFan is able to handle every language construct. This doesn't mean that all of a sudden using a weird language construct like `with` is blazingly fast; but it means that the presence of one of these *optimization killers* in a function no longer disables the optimizing compiler completely for that particular function.

<p><center>
  <a href="https://docs.google.com/presentation/d/1_eLlVzcj94_G4r9j9d_Lj5HRKFnq6jgpuPJtnmIBs88/edit#slide=id.g2134da681e_0_672">
    <img src="/images/2017/optimization-killers-20170403.png" alt="Optimization Killers" />
  </a>
  <br />
  <small><i>
    Source:
    <a href="https://docs.google.com/presentation/d/1_eLlVzcj94_G4r9j9d_Lj5HRKFnq6jgpuPJtnmIBs88/edit#slide=id.g2134da681e_0_672">TurboFan: A new code generation architecture for V8</a>,
    MNUG March '07 Meetup,
    <a href="https://twitter.com/bmeurer">@bmeurer</a>.
  </i></small>
</center></p>

Probably the most important changes are fully optimizable `try`-`catch`/`try`-`finally` statements, generators and `async` functions, and of course you can now use `let` and `const` without the risk of hitting the infamous [Unsupported phi use of const or let variable](https://github.com/vhf/v8-bailout-reasons/issues/12) bailout.

One interesting and somewhat surprising follow-up was the discussion triggered by the performance advice I gave on what I called *Declarative JavaScript* in my talk:

<p><center>
  <a href="https://twitter.com/michaelhaeu/status/845003383153025024">
    <img src="/images/2017/declarative-javascript-20170403.png" alt="Declarative JavaScript" />
  </a>
</center></p>

First of all, it seems that various people are confused by the terminology. It seems that using the terms "explicit vs. implicit" instead of "declarative vs. obscure" is easier to understand for many people, so just imagine those terms when staring at the slide above. The main controversy however was around whether it makes sense to use this advice or assume that the engine will optimize all of this under the hood.

Given infinite resources, V8 could generate better code for the right-hand side as well (and Crankshaft used to do this in the past), where it only checks for `undefined` and objects, and deoptimizes on all other inputs. That reduces the number of checks in optimized code. However it comes at a price: It can deoptimize the optimized code as soon as new values enter here, and the engine needs to track what kind of values were seen for `obj` in the baseline case, which requires time and memory.

But the reality is: V8 doesn't have infinite resources. In fact with more and more low-end Android devices entering the mobile web, and less and less traffic coming from high-end mobile devices or desktops, it seems that V8 (and Chrome) will have even fewer resources available in the future. Reducing overhead and optimizing less aggressively has helped a lot in the past two years to significantly improve the experience on mobile.

I sometimes hear developers say that these startup issues don't matter to Node.js, and V8 shouldn't penalize what they call *server performance*, but then the next thing I hear is them complaining that TypeScript, UglifyJS, Webpack, Babel, etc. run way too slow. This also runs on V8 and also suffers a lot from overhead during warmup, or too aggressive optimizations leading to frequent deoptimizations. I've seen a lot of evidence that reducing over-optimization has helped server workloads significantly, as for example measured by the Node.js AcmeAir benchmark.

<p><center>
  <a href="https://twitter.com/bmeurer/status/834677090381348865">
    <img src="/images/2017/acmeair-20170403.jpg" alt="AcmeAir" />
  </a>
</center></p>

The throughput improved by over 45% mostly by reducing overhead in V8, accomplished via work guided mostly by client-side workloads. So for typical server-side workloads things don't look too different.

And there's another important aspect that tends to be forgotten easily: V8 is not the only JavaScript engine you should care about. It's certainly very dominant due to it's use in Chrome, Node.js, Android and Opera, but limiting yourself to a single engine and optimizing for that - or hoping for certain optimizations to happen in V8 - is certainly not the way to success.

Speaking of the example above, whether or not [ToBoolean](https://tc39.github.io/ecma262/#sec-toboolean) is heavily optimized by the engine or not, and specifically what kind of feedback is tracked and consumed about the incoming values, is and should remain somewhat irrelevant. If you can write your hot code in a way that is optimizable independent of certain speculative optimizations, you should favor that way. For example, when you have a value `obj` that can either be `undefined` or an object, consider ruling out `undefined` explicit via

{% highlight javascript %}
if (obj !== undefined) {
  // …
}
{% endhighlight %}

or even better:

{% highlight javascript %}
if (obj !== void 0) {
  // …
}
{% endhighlight %}

This might also help your future self understanding this code in two years, as with

{% highlight javascript %}
if (obj) {
  // …
}
{% endhighlight %}

it's not clear that all you intended to do back then was to rule out `undefined` for `obj`.

This is especially useful to keep in mind when using `||` and `&&` in JavaScript. For example I've seen developers using `||` to implement default parameters like this:

{% highlight javascript %}
function foo(a, b) {
  a = a || "value";
  b = b || 4;
  // …
}
{% endhighlight %}

When asked whether the empty string is a valid input for `a` or `0` is a valid input for `b`, they were quite surprised to notice that they would rule out valid inputs this way. So don't do this! Instead use the ES2015 feature:

{% highlight javascript %}
function foo(a = "value", b = 4) {
  // …
}
{% endhighlight %}

This only replaces `undefined` values with defaults, which is sane. There's also an [interesting performance aspect](https://github.com/developit/preact/pull/610) to using `&&` and `||` in JavaScript. I'll see if I can do a series about writing *Explicit JavaScript* with focus on performance aspects from the VMs perspective, which might help to shed some light on this topic.

My usual disclaimer applies: I'm not a front-end engineer. I have different priorities than you might have, and there might be good reasons for you to ignore any kind of advice that I give here. That's perfectly fine. Also be careful with over-optimizing!

