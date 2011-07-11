---
layout: post
title: Progress again
tags: [xfce, thunar]
---

So, I'd say the *"Shame on you, Benny"*-debate is over and we're able to make progress again. Atleast, Jasper is requesting input. I'm going to prepare a small collection of diagrams with the most important stuff I've set up so far and that'll be the rough direction for the next weeks. While the lower-level stuff is mostly settled (the left-over stuff is mostly implementation specific), the high-level stuff is mostly undefined. E.g. somebody would have to work out a set of preferences that should be configurable for Thunar. For techies, there's the outstanding **ThunarTrashFolder** and **ThunarTrashFile** to define and implement (the latter is pretty simple, the most important thing here is to override the **get_visible_name()** method using the name set when trashing the file, but the former is really complex and care must be taken so the implementation does not result in something completly unmaintainable). There are a few more open issues (bookmarks, treepane, removable devices, ...), so people that complained previously should be able to get their hands dirty really soon (but as a limitation, developing on Thunar is not firing up vi and starting to write code).
