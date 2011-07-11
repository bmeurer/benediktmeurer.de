---
layout: post
title: Thunar Designing the architecture
tags: [xfce, thunar]
---

As the overall feedback on the Thunar suggestion was very positive, I think we are mostly settled with the user interface now. Only minor changes will happen on the user interface, no more major changes on the UI concept.

So it's now the time to start to design the basic architecture for Thunar. Work on the MIME system was already started and a few bits and pieces can be found on the Wiki. The interesting part will be to design the ThunarView architecture, that is the way the main view will be designed and connected to the backend(s). My first idea here looked like this:

<a href="/images/2005/thunar-view-model-idea-20050324.png"><img src="/images/2005/thunar-view-model-idea-20050324.png" width="99%" hspace="2" vspace="2" /></a>

The idea is to separate the user interface part from the data storage (where storage is the wrong term here, as the <i>data</i> is already stored in the file system, a better term would be <i>data manager</i>). The volume manager is required to properly implement the Trash specification and to list the removable devices in the sidebar (both the shortcuts and the tree). On Linux we may use HAL to implement the volume manager, but HAL won't be a requirement, esp. since it's not portable at all, which conflicts with Xfce's major goals.

This design offers several advantages (yes, it looks obvious, but it's not; check other file managers and see for yourself): Adding different backends in the future or converting existing backends (e.g. move to D-VFS) will be very easy. Adding new views (like Column View or Tree View) will be very easy (version 1.0 should ship with List View and Icon View). The whole trash related functionality is implemented in one single place (except for the `trash_file()` function, but this function is more or less easy), which is a very good thing, since the trash spec is tricky and scattering the functionality over the source tree would surely become a maintaince problem over time.

More detailed information about this idea can be found on the <a href="http://thunar.xfce.org/wiki/design:overview#the_main_view">Thunar Wiki</a>.

