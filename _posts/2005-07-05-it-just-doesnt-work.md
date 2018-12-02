---
layout: post
title: It just doesn't work(TM)
tags: linux
---

I just spent some time reading through the recent <i>Why Linux won't work on the desktop</i> and <i>The Linux desktop of the future</i> stuff. <b>Just works(TM)</b> seems to be the most important point today, and many projects claim to follow that idea. My experience is that most things <b>just work</b> if <i>[long list of conditions skipped]</i>.

Playing the devils advocate, I think that things are even worse than before on the Unix/Linux desktop: While some time ago, a lot of stuff was very Linux specific and you had to port it yourself if you happen to run a Unix or a BSD system, today you have to run a specifc Linux distribution (at a specific version) to get a chance to have certain things running. So instead of being Linux specific, which is already not a good thing, stuff is now Linux distro vendor specific. A simple example: Try to get Mono into a usable state on a slightly out-of-date Debian system (yeah, I know, Debian is always a bit behind, but this is really just a bit behind the latest stable release for various reasons): It isn't trivial. It's just pain. Waste of time probably.

And there are several other examples. HAL comes to mind here. The initial idea was very good. A platform independent hardware abstraction layer. But in it's current state you need to run a very specific version of the Linux kernel. No chance to get see this running on anything else in the not so far future (yeah, I know there's a <code>solaris/osspec.c</code>, but if you look closely, it's just a dummy).

I remember a time where the <i>vendor-independence</i> was a big plus for the Unix/Linux desktop, and I remember a lot of people complaining about the dependency on Microsoft for the Windows products. Now, it looks like the <i>vendor-dependency</i> is being ported from Windows to Linux.

Sure you could say <i>"The stuff will be ported at a later time"</i>, but let's be honest, Microsoft could tell exactly the same.

I was very surprise to see that from the big two on the Unix/Linux desktop, KDE is far ahead of GNOME when you use it on a machine that doesn't run a product made by RedHat or Ximian/Novell. You get nearly 99.99% the same functionality with an old Linux/i386 system, a new Linux/i386 system, a Solaris/sparc and a FreeBSD/i386 machine. That's pretty amazing and very encouraging. It's nearly as platform-independent as Xfce. ;-) Although, to be fair, KDE provides a lot more services than Xfce, so you can say, the KDE people did a good job. With recent GNOME releases it's kinda frustrating, esp. if you just want to check something in Nautilus (e.g. to verify that Thunar will behave similar). For example, I don't see any removable devices on FreeBSD or on that older Linux machine, although Konqueror displays them. Even the Thunar prototype does that already in the BSD volume manager implementation, and it's really easy. Even CDE provides better volume management on Solaris than recent GNOME versions. Then the SMB module in GnomeVFS. I have no clue about SMB and CIFS, but even Xffm works way better than GNOME here. GNOME never sees the Windows machines during testing. And there are several other things that don't <b>just work</b>.

Now I'm not a desktop user. I don't use a file manager. I mostly interact with applications running inside a terminal emulator. And of course, browser and mail reader. But I wasn't talking about myself. I was talking about the average user. And the average user won't be pleased to discover that <b>just works</b> is bound to 100 conditions (atleast if his system does not fullfil 99 of these conditions).

It may look like an advantage to Novell to ship something with their distribution, which doesn't easily run on other systems as well. But if you look back in time, that wasn't the way of the world so far. Imagine back in the days before the internet as you know it today, somebody would have come up with: <i>"Hey, here's TCP/IP and there's the socket interface, which can be used to connect networks to form the internet. But, ehm, you'll need to run 4.2BSD to use it. You cannot get it to work on other systems. That's intentional. Everybody should run our beloved system."</i> Doesn't sound like this would have worked, does it?

It's more than ok if the first public version doesn't support all the operating systems out there. But it would be good if released software would run equally well on all supported systems. And in the case of GNOME: While the desktop is in reality just the core of C programs, most people also think of 3rd party stuff like Beagle, etc. as GNOME components, and it doesn't matter if you tell them that it's not part of the core and thereby not officially supported; they'll be disappointed to see that only half of <i>their GNOME</i> works.

To conclude (as usual, just my 2 cents, nothing that's neccesarily true): With the current direction, it is very doubtful that the Unix/Linux desktop can compete with Windows and OSX in the future. That's even independent of Microsoft and Apple. The problem is that people started to cut off their very own roots.

