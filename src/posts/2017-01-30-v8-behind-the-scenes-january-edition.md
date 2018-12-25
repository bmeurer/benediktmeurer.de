---
title: "V8: Behind the Scenes (January Edition feat. Ignition+TurboFan and Community Engagement)"
tags:
  - presentations
  - turbofan
  - v8
---

Not a lot happened behind the scenes of V8 since [the December Edition](/2017/12/20/v8-behind-the-scenes-december-edition) due to holidays
and planning for 2017, so this is going to be a brief article. The most exciting V8 event for the web world was probably [turning on the
flag for WebAssembly by default](https://twitter.com/bmeurer/status/818534650993934336) in Chrome M57 and Node 8.

## Ignition and TurboFan

As mentioned [earlier](/2016/11/25/v8-behind-the-scenes-november-edition), we are planning to ship the new compiler architecture based on
the Ignition interpreter and the TurboFan compiler this year, ideally by the end of this quarter. Despite holidays we have made a lot of
progress with getting closer to the finish line. For example we have finally caught up with the default configuration (based on fullcodegen
and Crankshaft) on the [AcmeAir](https://github.com/acmeair/acmeair-nodejs) benchmark used to measure Node.js throughput performance.

<center>
  <img src="/images/2017/acmeair-20170130.png" alt="AcmeAir results" />
</center>

I'm also excited about the page load time improvements we achieved with Ignition and TurboFan on various pages, as this area is highly
relevant to the [web performance crisis](https://channel9.msdn.com/Blogs/msedgedev/nolanlaw-web-perf-crisis).

<center>
  <img src="/images/2017/toppages-20170130.jpg" alt="Top Pages" />
</center>

Most of these improvements are possible because we can reduce the number of optimizations and deoptimizations during startup, but
also because we need to parse only once now to generate Ignition bytecode, and optimized code is then generated from bytecode rather
than having to reparse the function for Crankshaft.

## Community Engagement

In 2017 the V8 team wants to engage more actively with the JavaScript community, both the world wide community, but also the local community in
the Munich area. I just gave a talk on [High-Speed ES2015](https://docs.google.com/presentation/d/1wiiZeRQp8-sXDB9xXBUAGbaQaWJC84M5RNxRyQuTmhk)
at this months' [Munich Node.js User Group meetup](http://www.mnug.de/archive.html#2017_01_12), and we will speak about benchmarks and real world
performance at the next [MunichJS User Group meetup](http://www.munichjs.org/meetups/?event_id=67). I'm excited to announce that we will host
both the next MunichJS User Group meetup in February and the next Munich Node User Group meetup in March in our new [Isar
Valley](https://twitter.com/holfelder/status/824670776917954564) event space at Google Munich - with Pizza and
[gBräu](https://untappd.com/b/tilmans-biere-gbrau/1390481)!

@[youtube](XBSyyxN7Q-o)

Of course we also submitted a lot of talk proposals to various JavaScript and Node conferences, so expect to meet a lot more V8 folks, especially
folks that you may not know in person yet, this year (depending on acceptance of these proposals, of course).
