---
title: Icon view item renderer
tags: thunar
---

One of the first things that perplexed me when I looked at GtkIconView (back in the gtk 2.5 days) was <i>"why the hell is there no GtkIconViewItemRenderer?"</i>. I guess somebody was worried about performance and therefore the renderer was hardcoded into the first icon view implementations (which is of course not very flexible and can lead to weird work-arounds on the model side). Unfortunately, I hoped that over the time somebody else would notice the problem and magically fix it for the stable 2.6 icon view.

Now, that was not the case. Gtk+ 2.6 API has stabelized and no <i>GtkIconViewItemRenderer</i>. We'll have to implement our own renderer-based icon view with <i>ExoIconView</i>, which means that once that is done, not only the icon view implementation in libexo will differ from gtk+ (there are some major performance improvements pending for libexo 0.3.1 or 0.3.2), but also will <i>ExoIconView</i> provide the programmer with a completely different interface.

We really need this flexibility for the icon view in thunar, in order to be able to render emblems, etc., in a simple and fast way. The alternatives would be either a full-featured canvas widget (like Nautilus does with EelCanvas) or to pre-generate pixbufs with the embedded emblems in the list model, which would mean unnecessarily creating and copying a lot of pixbuf stuff. Both alternatives are certainly not very well suited for a fast (and lightweight) file manager.
