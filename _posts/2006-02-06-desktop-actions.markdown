---
layout: post
title: Desktop actions
tags: [xfce, thunar]
---

I finally came around to fix some long standing issues with the internals of the file launching stuff in Thunar (to sum it up: it was a mess). Now it's cleaned up, and with the new classes it was actually too easy to add support for desktop actions (see the desktop file spec for details) to Thunar (Brian already added support to Xfmedia some time ago).

<center><a href="/images/2006/desktop-actions.png"><img src="/images/2006/desktop-actions.png" width="310" /></a></center>

In addition the <i>Open With</i> actions are now also available if more than one file is selected.

