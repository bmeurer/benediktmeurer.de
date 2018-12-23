---
title: Thunar startup
tags: thunar
---

I decided to do some profiling on Thunar startup to find out why it takes 2-3 seconds to popup here using the Gtk+ 2.8 port (while it starts up faster with the full debug build of Gtk+ 2.9). Using <a href="http://primates.ximian.com/~federico/news-2006-03.html#09">Federicos simple access() trick</a>, I found out that the majority of time was spent in `gtk_window_size_request()` and `gtk_window_realize()`.

<center><a href="http://www.foo-projects.org/~benny/tmp/thunar-profile-startup/thunar-profile-startup1.png"><img src="http://www.foo-projects.org/~benny/tmp/thunar-profile-startup/thunar-profile-startup1.png" width="90%" /></a></center>

Looking at the relevant parts of the <a href="http://www.foo-projects.org/~benny/tmp/thunar-profile-startup/thunar-profile-startup1.truss.log">truss output</a> it was very easy to locate the cause of the problem. <code>gtk_window_realize()</code> loaded the <code>GtkIconTheme</code> instance for the default screen, which in turn tried to <code>stat()</code> every icon in Tango and all inherited icon themes. Looking at the Gtk+ source, it shouldn't <code>stat()</code> the icon files if an updated <code>icon-theme.cache</code> file is found. Since I had updated <code>icon-theme.cache</code> files for all relevant icon theme directories (the truss output also shows that after <code>stat()</code>ing all icon files, the <code>icon-theme.cache</code> file is finally used), it should not <code>stat()</code> the icons, but only the icon directory (according to the Gtk+ source).

So after some further research, I found <a href="http://cvsup.pt.freebsd.org/cgi-bin/cvsweb/cvsweb.cgi/ports/x11-toolkits/gtk20/files/patch-gtk_gtkiconcache.c">this patch</a>, which gets applied to the <code>x11-toolkits/gtk20</code> FreeBSD port. The patch basicly changes the icon cache loading to first <code>stat()</code> all icon files in the theme and test if any of them is newer than the cache file. That does of course make the startup slow (the startup of <b>every</b> Gtk+ application on FreeBSD). Whoever came up with that idea was definitely on crack.

Ok, so removed that patch, rebuilt the port, and voila...

<center><a href="http://www.foo-projects.org/~benny/tmp/thunar-profile-startup/thunar-profile-startup2.png"><img src="http://www.foo-projects.org/~benny/tmp/thunar-profile-startup/thunar-profile-startup2.png" width="90%" /></a></center>

1/2 second from startup to <code>gtk_main()</code>, that's quite ok. Now whats left over is the question why <code>gtk_window_size_request()</code> takes that long on first call. Looking at the <a href="http://www.foo-projects.org/~benny/tmp/thunar-profile-startup/thunar-profile-startup1.truss.log">truss log</a> again, it seems to be the Pango initialization. Have to check this later...

## Update

For the sake of completeness, here's the time it takes to completely open and display (measured as <i>wait for the last expose event</i>) a folder (the thunar source directory, 223 files and folders) in Thunar:

<center><a href="http://www.foo-projects.org/~benny/tmp/thunar-profile-startup/thunar-profile-startup3.png"><img src="http://www.foo-projects.org/~benny/tmp/thunar-profile-startup/thunar-profile-startup3.png" width="90%" /></a></center>

1.3 seconds isn't that bad for a first unoptimized release. Still room for improvement, tho.
