---
layout: post
title: Testing GtkIconView 2.8
tags: [xfce, thunar, exo]
---

I refactored the new GtkIconView into an ExoIconView implementation, added the required magic to ExoCellRendererEllipsizedText and did some testing. The result was disappointing: It is very slow for large models (1000 items and above), esp. in resizing and rubberbanding, even on a fast machine (with Render hw accel). I imagine that it would be frustrating to use Thunar with this icon view on a slightly slower machine. Besides that it contains some tricky rendering bugs (one of which looks pretty similar to a bug I've also in my own experimental icon view, where the focus rect is not cleared properly sometimes).

I'm sure there's a lot of potential for optimization in the new GtkIconView, but since the source file contains about 9000 lines now and internals have changed quite a bit, this would waste a lot of time and energy. And so, I'll finish the work on the <i>old</i> ExoIconView, which is reasonably fast already, even with very large models.

