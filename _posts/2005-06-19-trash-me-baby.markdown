---
layout: post
title: Trash me, baby
tags: [xfce, thunar]
---

Postponed all work on the icon view for now, and been working on the volume manager and the trash implementation for the last 2 days. As initially planned, the <code>ThunarFile</code> class is now an abstract base class and the <code>ThunarFolder</code> class will be turned into an interface or an abstract base class as well. In addition, the <code>ThunarFile</code> class won't export the associated <code>ThunarVfsInfo</code> (which is now only associated with <code>ThunarLocalFile</code> instances). This way we don't limit ourselves to file implementations, which are more or less based on <code>stat(2)</code> directly. For example, there will be virtual files, like the trash can itself, and <i>forward</i> files like the trashed files. You could even imagine another class that handles locations other than <code>file://</code> and <code>trash://</code> using GnomeVFS, to provide support for network file systems and such. But that is an optional gimmick and not important right now.

While working on the trash classes, I was testing the basics when I realized that the far-from-being-complete implementation of the <code>ThunarTrashFile</code> and the not yet adjusted <code>ThunarFolder</code> class lead to an interesting effect:

<a href="/images/2005/thunar-trash-b0rked2.png"><img src="/images/2005/thunar-trash-b0rked2.png" width="90%" /></a>

I was pretty confused to see this <i>working</i> on first sight. My bet was that it would crash right away. But of course, it had to work that way. Anyway, not the expected behaviour from a user's point of view, but it looks just too weird to not post the screenshot here.

