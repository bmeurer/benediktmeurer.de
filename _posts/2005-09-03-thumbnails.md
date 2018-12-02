---
layout: post
title: Thumbnails
tags: thunar
---

It took quite some time and it wasn't very enjoyable, but now Thunar finally supports thumbnails (at least loading):

<a href="/images/2005/thunar-thumbnails-20050603.png"><img src="/images/2005/thunar-thumbnails-20050603.png" width="90%" /></a>

It's not yet committed tho. Fortunately most desktop applications already store thumbnails today, so the file manager seldomly needs to generate a thumbnail itself. For the generation, we'll support whatever GdkPixbuf supports (we'll probably also include a fast jpeglib based generator), and optionally support the GNOME thumbnail generators. The GNOME thumbnails generators are just tools that write the final thumbnail to a file specified on the command line, which is good. Unfortunately the GNOME guys decided to store the generator list in GConf, which means that the GNOME thumbnailer support will depend on GConf, and thereby comes at a certain price.

The thumbnail loading is quite fast, but nevertheless adds a little overhead (both memory and CPU time). Therefore we'll most probably include an option to disable thumbnailing completely. The good news is that Thunar is still very light on memory. A quick and dirty measurement (on a FreeBSD/i386 5.4-STABLE box with Gtk+ 2.6) shows, that Thunar's <code>VmData</code> size is at <code>2228 kb</code> after startup (displaying the first 12 items from my home dir). For example, Nautilus' <code>VmData</code> size is <code>4368 kB</code> after startup displaying the same set of files (in browser mode and without the sidebar), while ROX is at <code>2988 kB</code> and Xffm-iconview is at <code>2532 kB</code>. Of course this is far from a serious benchmark, but it tells me that we're on the right way.

What we really need with Thunar (or in a separate tool based on Thunar-VFS) is a way to cleanup dead thumbnails:

```
$ ls -1 ~/.thumbnails/normal|wc -l
   5867
```

### Update 

For the sake of completeness: Konqueror's <code>VmData</code> size is <code>4364 kB</code> (KDE 3.4).
