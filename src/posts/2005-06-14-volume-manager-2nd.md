---
title: Volume Manager (2nd)
tags: thunar
---

I tried to come up with the basic requirements for the volume manager interface and did some prototyping with the BSD implementation. My mail to thunar-dev, which summarizes the results of my current research, is still pending - I guess I shouldn't attach source code to mails. :-)

Anyways, I think I caught the basic requirements for Thunar 1.0:

<a href="/images/2005/ThunarVFS-volume-manager-requirements-20050613.png"><img src="/images/2005/ThunarVFS-volume-manager-requirements-20050613.png" width="90%" /></a>

The question that remains is whether the volume manager should be implemented in the Thunar binary or as separate D-BUS system service. There are pros and contras for both solutions. If you feel like you have something to say about this topic, wait for my mail to arrive on thunar-dev. :-)

The prototyping with the interface described by the requirements above was satisfactorily so far. I hacked up a simple interface to the volume manager for the favourites pane and it now shows all removable devices, whose medium status is active, like in the screenshot below:

<a href="/images/2005/thunar-volume-manager-20050613.png"><img src="/images/2005/thunar-volume-manager-20050613.png" width="90%" /></a>

Hopefully the discussion on the volume manager will come to a useful result soon and work on the trash system design can start.
