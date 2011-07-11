---
layout: post
title: Icon view renderer
tags: [xfce, thunar, exo]
---

I just updated my gtk+ sandbox and, wow, the new GtkIconView in gtk 2.8 does exactly what is required (atleast from a first look), without breaking the API, thanks to RedHat's Matthias Clasen. The new icon view uses cairo for rendering, which of course leads to flickering and rendering errors if combined with the <i>good old way</i> of rendering things in GDK, since the cell renderers in a Gtk+ 2.4/2.6 installation still use plain Xlib functions (through the GDK wrappers). But this is more or less easy to fix, as we can use GDK functions instead of cairo functions (probably Xrender for the rubberband... tho, unfortunately the most interesting function in GDK here isn't public).

In addition, there are some problems with the cell renderer text API in gtk 2.4/2.6, which doesn't include the <code>wrap-mode</code> and <code>wrap-width</code> properties. But these properties are required to layout the text properly. Again, not necessarily hard to work around; if everything else fails, the ExoCellRendererEllipsizedText class will be extended to support the text wrapping properties and will be used as default text renderer.

The more important problem is that my performance patch for the old ExoIconView won't work with the new GtkIconView class, atleast not without major rework. The patch basicly replaces the GList-based item handling with a faster array based solution, which reduces both heap fragmentation and reduces time spend in malloc and time spend in loops looking up the item for a given index. The next step was to use a static item layout, which makes things like looking up the item for a position or determining the items within a rubberband selection very fast (tho, that was still work-in-progress and didn't really work). Well, I guess, I'll first import the new icon view and stuff into libexo and do some testing on it, and then we'll see how important it is to forward-port the performance patches.

