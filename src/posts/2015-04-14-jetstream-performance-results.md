---
title: JetStream performance results
---

The <a href="https://developers.google.com/v8/" rel="noreferrer" target="_blank">V8</a> team has been working hard on improving JavaScript
performance recently, where performance means both peak performance (as in throughput of long running computations)
as well as user visible latency (as in time wasted not doing useful work towards completing a computation or rendering a
website).

It is not always easy to improve both throughput and latency, especially since it usually introduces latency to generate
the perfect code for optimal throughput. So there's always a trade-off to consider. Also the existing benchmark suites used to
focus on either latency (i.e. the <a href="https://www.webkit.org/perf/sunspider/sunspider.html" rel="noreferrer" target="_blank">SunSpider
1.0.2 JavaScript Benchmark</a>) or throughput (i.e. our own <a href="https://developers.google.com/octane/"
rel="noreferrer" target="_blank">Octane</a> benchmark), but not both.

Apple tried to address this problem by <a href="https://www.webkit.org/blog/3418/introducing-the-jetstream-benchmark-suite/"
rel="noreferrer" target="_blank">introducing a new benchmark suite</a> that aims to combine latency and throughput benchmarks with roughly equal
weighting, the <a href="http://browserbench.org/JetStream/" rel="noreferrer" target="_blank">JetStream</a> benchmark suite. It contains benchmarks
from both SunSpider and Octane, but also additional interesting benchmarks, like various <a href="http://emscripten.org"
rel="noreferrer" target="_blank">Emscripten</a> compiled C/C++ programs.

So JetStream seems to be a good candidate to measure our progress on improving overall performance of Chrome/V8 (considering
both throughput and latency). As you can see from the chart below, we have been doing well pretty lately. Chrome 44 (current
canary build) beats both Firefox and Safari, and we're working on reducing the latency further for the next release. The numbers
were measured on a MacBook Pro (Mid 2012 / 2.3 GHz Intel Core i7 / 16 GB) running OS X 10.9.5.

<figure>
  <a href="/images/2015/jetstream-20150414.png"><img src="/images/2015/jetstream-20150414.png"></a>
</figure>
