---
layout: post
title: Spatial Thunar
tags: thunar
---

I took the time and implemented parts of the core functionality for Thunar, as thunar-dev is pretty quiet when it comes to code-independent development. Below is a screenshot of the very first test application showing the some of the core classes in action - it's really spatial and it'll never be that spatial again. :-)

<a href="/images/2005/thunar-first-code-20050604.png"><img src="/images/2005/thunar-first-code-20050604.png" width="90%" /></a>

I decided to postpone my plans for a fully multi-threaded core. There's actually a lot of stuff to take care of in order to make it both right and fast. It's not necessary possible to completely hide the multi-threadedness within the ThunarFile and ThunarFolder classes, so people writing high level classes like ThunarListModel, ThunarTreeModel or ThunarDesktopView, would be presented with a more complex interface, which in turn can decrease the stability of the whole application.

The approach taken now is faster for loading directories and it makes things way easier to handle, but it can make the UI feel unresponsive while loading large directories or loading from slow media.

