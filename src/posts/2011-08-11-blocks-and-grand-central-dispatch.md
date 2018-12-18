---
layout: post
title: Blocks and Grand Central Dispatch
tags: ios
---

Yesterday I held a talk about <a href="http://en.wikipedia.org/wiki/Blocks_(C_language_extension)">Blocks</a> and
[Grand Central Dispatch](http://en.wikipedia.org/wiki/Grand_Central_Dispatch) at the second monthly [CocoaHeads
Siegen](http://cocoaheads.informatik.uni-siegen.de) meeting.
My [slides](/files/blocks-and-grand-central-dispatch2011.pdf) are available for download from the CocoaHeads Siegen
[website](http://cocoaheads.informatik.uni-siegen.de/#2011-08-10). The presentation gave rise to some interesting
discussion about networking performance with and without GCD, so today I'm digging into that
[GCDAsyncSocket](http://code.google.com/p/cocoaasyncsocket/wiki/Reference_GCDAsyncSocket) thing again.
