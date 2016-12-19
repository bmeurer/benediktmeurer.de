---
layout: post
title: Following up on JavaScript benchmarks
---

Following up on my [latest blog post on the truth about traditional JavaScript benchmarks](/2016/12/16/the-truth-about-traditional-javascript-benchmarks)
here are a couple of comments I'd like to address. First of all, I'm over-exaggerating quite a bit with the intention to actually
trigger a discussion, for example not everyone hated JavaScript with passion before 2007, there were quite a few developers who
already used it daily and who were excited to have a tool that just get's the job done (for publishing on the web). Also JavaScript
is certainly not the only important technology in software engineering these days, there are many important technologies that have
nothing to do with JavaScript. Nevertheless speaking of the overall impact, JavaScript is probably the top item currently, and
here's why:

Let's have a look at the most important deployment scenarios that we have for software today, there's

- the web platform (client-side),
- the cloud and server-side,
- phones, wearables and entertainment devices,
- game consoles, and
- Windows.

For at least the first three of them, JavaScript is an important component today, in case of the web platform, it's even the
dominant factor for the overall success. There's probably no other single technology that has the same overall impact, even
though there are technologies that dominate a certain specific area of software engineering that are not related to JavaScript.

## Speedometer

I realized that many folks in the web sphere weren't even aware of the existence of the [Speedometer benchmark](http://browserbench.org/Speedometer).
We should change that. Speedometer is definitely not the ideal benchmark either, but we learned in 2016, that's it's a lot
closer to real world web application patterns than anything we had before. There is an on-going effort to modernize Speedometer
to also cover recent technologies ES2015, [TypeScript](https://www.typescriptlang.org) and [Webpack](https://webpack.js.org).

I'd like to respond to some criticism that I got for pointing to Speedometer just because V8 cannot win the [*official Google
benchmark*](https://developers.google.com/octane) any more: Despite what folks might believe I truly believe in benchmarks as
ways to improve the web platform! Competition is key here. But competition has to reflect real improvements, so it's important
to pick the benchmark based on real world applicability, which is honestly very hard to judge. And let's be completely open and
honest here: Apple is clearly setting the bar high for everyone wrt. real world web performance! This is and will be a major
challenge for us, but I'm excited to pick up that challenge!

<p><center>
  <img src="/images/2016/speedometer-20161219.png" />
</center></p>

We have been adding ways to Chrome infrastructure to measure performance from inside the browser, which gave a lot of important
insight, but is not portable across browsers. From these investigations I am concluding that Speedometer might be the best
proxy for real world performance that is currently available. We will follow up with a detailed blog post about the real
world performance effort soon.

## Node.js

I'm heavily focusing on client-side uses of V8 in the blog post. But that doesn't mean that we don't care about [Node.js](http://nodejs.org).
In fact we do care a lot about Node.js applications nowadays and we are highly interested in ways to measure performance.
Currently we are looking into ways how to use real world Node.js applications like [yarn](https://yarnpkg.com) to drive
and track performance improvements, but we are only at the beginning. We are also obviously looking at the 
[AcmeAir](https://github.com/acmeair/acmeair-nodejs) benchmark. We have [built a good relationship](http://v8project.blogspot.de/2016/12/v8-nodejs.html)
with the Node.js community this year, and we're already seeing a lot of benefits there.
