---
layout: post
title: Random crashes with iOS 4.2.1
---

I received several complaints about random crashes lately. The complaints of course did not mention any specific version of iOS nor any other useful details. So I had to digg into it myself. As it turned out the crashes were due to the use of `DISPATCH_QUEUE_PRIORITY_BACKGROUND`, which is not only unavailable with iOS 4.2.1 (and earlier), but also causes `dispatch_async` to crash - which is rather bad IMHO, a fallback to `DISPATCH_QUEUE_PRIORITY_LOW` would be better from both the user's and the developer's POV.
