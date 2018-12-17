---
layout: post
title: Trash is back
tags: thunar
---

Because this feature was requested quite often, and it somewhat makes sense for a file manager, I'll add trash support (based on the <a href="http://freedesktop.org/wiki/Standards_2ftrash_2dspec">trash specification</a>) for the next release (most probably RC1).

<center><a href="/images/2006/thunar-trash-experimental.png"><img width="430" src="/images/2006/thunar-trash-experimental.png" /></a></center>

Trash support will be transparently available to all applications using thunar-vfs (no API/ABI breakage, just a few special methods added), and it should be easy to develop a panel plugin that displays the trash can or add a trash can to xfdesktop.

Unfortunately the problem of interoperability of <code>trash:</code>-URIs remains, but that should be a minor problem as long as people don't try to use the trash as primary storage for their documents.
