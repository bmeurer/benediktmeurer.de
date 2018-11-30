---
layout: post
title: Slow media
---

While testing some volume manager related stuff, I tried to load a large folder from a CD-ROM (the i386 folder from one of my more or less unused Windows 2000 install CDs, which contains about 4000 files) into the tree view and it took forever, even after the folder content was visible (I suspect this is GtkTreeView loading icon data for the invisible items, tho haven't checked yet). And of course, since currently everything runs in the main thread, the GUI was blocked.

While I was aware of this problem, I decided to ignore it so far. On the solution side, we have basicly two possibilities: First we can do everything asynchronously or secondly we can do the fast stuff synchronously and add a "media://"-implementation, which does its work asynchronously (if somebody has a slow NFS-mount, he won't have fun with most probably every other program either, so we can safely ignore this case and focus on removable media). The first option is actually what I did for the very first prototypes and it turned out to be complex (I don't want to force everything into a limited low-level API like Gnome-VFS does, and so the high-level stuff would need to be thread-safe) and slow. The second option looks better to me, although it's still a lot of work to implement ThunarFolder and ThunarFile in a thread-safe way.

