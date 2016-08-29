---
layout: post
title: Setting up KDE 3 on NetBSD
---


## Introduction

Like most other Unix(TM)-like operating systems, the <a href="http://www.kde.org/">K Desktop
Environment (KDE)</a> is also available for NetBSD. KDE is a powerful graphical desktop
environment based upon <a href="http://trolltech.com/">Trolltech</a>'s <a
href="http://www.trolltech.com/products/qt/index.html">QT</a> library, and is similar to other
desktop environments available for Unix(TM) workstations, such as the Common Desktop Environment
(CDE) or <a href="http://www.gnome.org/">GNOME</a>. It tries to combine ease of use, contemporary
functionality, and outstanding graphical design with the technological superiority of the Unix
operating system. Like NetBSD itself, KDE is also an Internet project and is licensed under the
GNU General Public License (GPL), and is therefore open source software.


## Installation

It is quite easy to install the latest KDE 3 on a NetBSD system using either binary packages or
building it from <a href="http://www.pkgsrc.org/">pkgsrc</a>.  As I wrote this, there were no
official KDE 3 binary packages available on the ftp servers and I didn't have the space and
bandwidth to put my packages online :-(. It would be nice, if someone could provide me with a
few 100MB of web/ftp space to put my packages on, so that everyone reading this could use these
packages.

If you are not lucky to fetch some binary packages for KDE 3, then you should fetch a recent
pkgsrc from NetBSD-current (must be a post 20020830) and start building KDE from scratch.
Therefore you should change to the directory <code>x11/kde3</code> in your pkgsrc tree and
start by typing <code>make install</code>. <b>NOTE:</b> Before starting to install KDE 3, you
should remove any installed KDE package and the installed QT packages (if they're older
than 3.0.5), and do a <code>make clean</code> on your pkgsrc tree, else the installation might
fail. After starting the installation process, you'll need to wait up to 3 days, until the
installation is complete, depending on the hardware of your machine. You might want to speed
up the installation process by mounting the filesystem that contains the pkgsrc tree with the
<code>async</code> option; e.g. type <code>mount -u -o async /usr/pkgsrc</code>, but beware,
that mounting a filesystem asyncronous may have a bad effect on your data if the computer
crashes. So, you have been warned, use this option at <b>your own risk</b>.


## Postinstallation

Now, that KDE 3 is installed properly, all you need to do, is setup your X session to start
KDE 3. Therefore edit (maybe create) the file <code>.xsession</code> in your home directory
and put in the following lines:

{% highlight sh %}
#!/bin/sh
export PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/pkg/bin:/usr/pkg/sbin:/usr/local/bin:/usr/local/sbin:/usr/X11R6/bin
exec /usr/X11R6/bin/startkde
{% endhighlight %}

Then mark the file executable by typing <code>chmod +x $HOME/.xsession</code>, login as usual
with xdm and feel happy about your new and fancy KDE desktop :-).

If you're using <code>startx</code> instead of <code>xdm</code>, you need to edit the file
<code>.xinitrc</code> in your home directory instead.


## Using antialiased fonts

You might also want to get KDE rendering those nice fonts you saw on all those screenshots all
over the web. Therefore you'll need to have <a href="http://www.xfree86.org/">XFree86</a> version
4.x installed (this is the default for NetBSD 1.6 and above). Then you need to install some nice
looking TrueType or Type1 fonts, therefore you can use the freely available webfonts provided by
Microsoft, simply install the <a
href="ftp://ftp.netbsd.org/pub/NetBSD-current/pkgsrc/fonts/ms-ttf/README.html">fonts/ms-ttf</a>
package and the <a
href="ftp://ftp.netbsd.org/pub/NetBSD-current/pkgsrc/fonts/ttmkfdir/README.html">fonts/ttmkfdir</a> package.
Then goto <code>/usr/X11R6/lib/X11/fonts/TrueType</code> and type:

{% highlight console %}
$ ttmkfdir > fonts.scale
$ mkfontdir
{% endhighlight %}

After that add the following line to your <code>/usr/X11R6/lib/X11/XF86Config-4</code>
in the <code>Files</code> section

{% highlight sh %}
FontPath "/usr/X11R6/lib/X11/fonts/TrueType/"
{% endhighlight %}

and

{% highlight sh %}
dir "/usr/X11R6/lib/X11/fonts/TrueType"
{% endhighlight %}

to your <code>/usr/X11R6/lib/X11/XftConfig</code>. Logout from your X session and restart your
X server by hitting <code>CTRL-ALT-BACKSPACE</code> at your xdm login prompt. Relogin to your
KDE desktop and enable "Use Anti-Aliasing for fonts" in the KDE control center; logout again and
relogin, and choose some nice antialiased fonts (the ones with the <code>[Xft]</code> in the
name) for your desktop. Enjoy! ;-).


## Feedback

I hope you liked my little KDE 3 HowTo and I would be pleased to
get some good (or even bad ;-) feedback from you. If you
have any problems or questions on this topic, I'll try to help you
getting things to work.

