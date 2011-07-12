---
layout: post
title: Trash, Bugs, Wasted Time
tags: [xfce, thunar, gtk]
---

So, the trash framework finally made its way into Xfce SVN. Still a bit rough around the edges, but that's mostly cosmetic fixes.

In other news, I wasted four hours hunting down <a href="http://bugzilla.gnome.org/show_bug.cgi?id=348953">a bug/incompatible change</a> in GTK+ 2.10, where the GtkTreeModelFilter doesn't behave properly anymore, which means that people using Thunar with GTK+ 2.10 and the tree pane will most probably not be able to run Thunar. The suggested solution for now is to switch to the shortcuts pane instead (or downgrade to GTK+ 2.8).

### Update

According to the responsible GTK+ maintainer that was an intentional break in the expected behavior of a <code>GtkTreeModel</code>. Of course, in a perfect world, toolkit maintainers would let application developers know of such breakage instead of waiting for other applications to crash... Thunar is now switched to the new behavior and will therefore work with GTK+ 2.10 again. Now we'll wait for the next crash. Maybe its worth the time porting Xfce to Qt; not that Qt is perfect, but atleast (if you have commercial support) you get useful comments about breakage in Qt that may cause trouble in applications.

