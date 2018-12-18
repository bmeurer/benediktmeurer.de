---
layout: post
title: "Interview “Three Frontend Questions to Benedikt Meurer” for YGLF Kyiv 2018"
canonical: "https://medium.com/@yglf_kyiv/three-frontend-questions-to-benedikt-meurer-52046667ff74"
tags:
  - interview
  - presentations
---

Before the conference the [YGLF crew](http://yglf.com.ua) wanted to learn more about the speakers, so they had asked them [#3FrontendQuestions](https://twitter.com/hashtag/3FrontendQuestions) related to their topics at YGLF and engineering experience. This is what I responded during the interview.

<figure>
  <img src="/images/2018/yglf-interview-20180510.jpg"
       srcset="/images/2018/yglf-interview-20180510.jpg, /images/2018/yglf-interview-20180510@2x.jpg 2x"
       title="Interview with Benedikt Meurer"
       alt="Interview with Benedikt Meurer">
</figure>

## Benedikt Meurer

Benedikt is a JavaScript compiler engineer who loves to tinker with different aspects of programming languages. He joined Google to work on the V8 JavaScript Engine, where he is working as tech lead for the Node.js performance team.

His talk at [You Gotta Love Frontend Conference](http://yglf.com.ua) is [“Brave New World: Moving on to ES201X”](http://yglf.com.ua/schedule/#Benedikt-Meurer-25-14-00) as well as lightning talk [“JavaScript: The fairly odd parts”](http://yglf.com.ua/schedule/#Benedikt-Meurer-24-16-30).

## V8 has market dominance. Do you feel the lack of competition?

This is my very own opinion, and doesn’t reflect Google’s or Chrome’s point of view.

I personally do feel the lack of competition in this space. For the growing JavaScript platform it would be awesome to have more competition. Right now we do have some competition in the web space, but that’s only a small part of the JavaScript space.

For example, both Node and Electron are growing very fast, and there’s not really competition on the VM side.

Similarly React Native currently ships with JSC only, and that’s mostly because V8 doesn’t run on iOS, which is not a fundamental limitation.

## Do you have performance regression tests for each pull request/commit? How long does it take to run all tests on V8?

We try to have correctness tests for each commit, but even that is often challenging, due to the various heuristics and different paths a single line of JavaScript code can take through V8.

We have a set of agreed upon performance tests that run on each individual commit.

## Funny third question. You’re have this quote in your twitter bio: “Probably broke the web for you once or twice” — please tell us at least one story?

Oh yeah that’s a fun story (in retrospect). 😁

I once made YouTube super crashy in Chrome stable for like a week: one day we noticed a super high crash rate on YouTube in stable, it was around one renderer crash per 100k page views, but we were in the middle of the stable cycle, so chrome hadn’t changed for a while.

That was odd. Even worse we couldn’t reproduce any crashes on YouTube even with the full team clicking around YouTube for hours. Then a colleagues wife started to see very reproducible crashes, and we tried from home and voila we were able to repro.

By that time the YouTube team also realized that, and they figured out that it was some software on YouTube that was recently updated, which doesn’t run on the internal Google network. So they were able to roll back that update and roughly 5 days later, YouTube started to stabilize in chrome again.

Meanwhile we tried to figure out from some crash dumps what was happening under the hood. And all dumps showed that we somehow leak “the hole”, which is a special marker that is used to mark holes in `Array`s. By that time we were mostly running with the Crankshaft compiler and the array code hadn’t changed for several releases.

One of my colleagues, [Toon Verwaest](https://twitter.com/tverwaes), one of the V8 gurus spend about a week auditing every single line of code that deals with `Array`s and he found and fixed a couple of unrelated bugs along the lines.

Turned out that we had recently enabled TurboFan for some weird language constructs that Crankshaft couldn’t handle, and one of the functions in the YouTube update actually used TurboFan sometimes. And in that function there was a call to the `Array` constructor, which I recently added to TurboFan. And that was missing a single line which marked the resulting array as _holey_ ( i.e. not packed). And so [V8](https://v8.dev) was using this array without doing proper hole checks on it.
