---
title: Xfcalendar improvements
tags: xfce
---

Mickael and Juha are doing a great job at improving xfcalendar recently. I'm pretty sure that Xfce 4.4.0 will ship with a very nice and very useful calendar application. Xfcalendar can already schedule appointments (tho it's still very rough on the edges), it currently looks like this:

<a href="/images/2005/xfcalendar-20050316.png"><img src="/images/2005/xfcalendar-20050316-thumb.png" border="0" /></a>

Once the technical part is done, the user interface should be revised, and xfcalendar should probably drop the dependency on the MCS manager. It would be so much easier (and better for the future when we drop MCS) to just store the 3 settings into a resource file (<a href="http://xfce.org/documentation/api-4.2/libxfce4util/libxfce4util-Resource-Config-File-Support.html">XfceRc</a> is your friend). There'll only run one xfcalendar instance per session anyways, so no concurrent write access problems.
