---
layout: post
title: And then there was trash...
---

The <code>ThunarFile</code> and <code>ThunarFolder</code> interfaces are now completely independent of the specific implementation. This makes it possible to support various different <i>file systems</i> with Thunar. As a first candidate, I implemented a first draft for the <i>Trash vfolder</i> today, which means Thunar is now able to display the contents of the trash cans currently connected to your system - well, in theory it is, but the trash manager doesn't handle foreign trash cans currently, but it will soon. :-)

<a href="/images/2005/thunar-trash-20050622.png"><img src="/images/2005/thunar-trash-20050622.png" width="90%" /></a>

Diving into trashed directories isn't supported yet, but shouldn't be a problem with the current interfaces.

