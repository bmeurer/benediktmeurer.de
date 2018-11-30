---
layout: post
title: New features in Thunar 0.4.0rc1
---


About a month ago <a href="http://thunar.xfce.org/news.html#2006-07-09">Thunar 0.3.2beta2</a>
was released as part of <a href="http://www.xfce.org/">Xfce</a>. Much has happened since that
time, and we're nearly ready for the first release candidate of Xfce 4.4.0 now, which should
be available in two or three weeks. So, it's time to sit down and check what we have in the
pipe for Thunar 0.4.0rc1.

Below is the list of features - focussing on the three most visible changes (to users) - that
are already available in the development version and will definitely be part of the first
release candidate. This list will hopefully be extended with some additional features if time
permits, but most probably not in time for 0.4.0rc1. The most interesting pending feature here
is network support for Thunar, which will include atleast browsing Samba shares and connecting
Samba shares (and probably other network file services as well) via smbfs or FUSE.


## Trash

Probably the most notable change when starting Thunar after upgrading will be the addition (or
better <i>re-addition</i>) of the trash support, which implements the <a
href="http://freedesktop.org/wiki/Standards_2ftrash_2dspec">Desktop Trash Can Specification</a>
(but is currently limited to the home trash).

<center><img alt"Trash Support" src="/images/2006/preview-0.4.0rc1/trash.png" /></center>

So when you delete files now, they will not be lost forever, but instead will be moved to your
trash can, and can be recovered easily by right-clicking on the file or folder and selecting
<b><u>R</u>estore</b> from the context menu.  If the location from where the file or folder was
moved to the trash is no longer present you'll be ask whether to recreate the required folders
in order to be able to restore the trashed resource.

If you want to permanently delete a file, you can either move it to the trash and then delete
the file in the trash, or hold down the <b>Shift</b> key while pressing <b>Del</b> or selecting
<b><u>D</u>elete</b> from the menu. You'll still need to confirm the permanent removal of files,
so you don't accidently remove an important file without any notice.

<center><img alt="Trash Panel Applet" src="/images/2006/preview-0.4.0rc1/trash-panel-applet.png" /></center>

You can also move files or folders to the trash by dropping them onto the trash can in the
shortcuts or tree pane, or by dropping them onto the trash panel applet, shown in the screenshot
above. The panel applet displays the current status of the trash can and allows you to empty the
trash can from the context menu. You will need to build Thunar with <a
href="http://freedesktop.org/wiki/Software_2fdbus">D-Bus</a> support in order to be able to use
the panel applet, because the applet does not monitor and manage the trash itself (to avoid any
additional overhead), but instead uses the new <code>org.xfce.Trash</code> interface to talk to
Thunar and lets Thunar do all the hard work.

It is expected that <code>xfdesktop</code> will also get a trash can for 4.4.0rc1, using the
<code>org.xfce.Trash</code> interface as well. But that is still work in progress.


## Rubberband Selection

With the addition of rubberband selection to <code>GtkTreeView</code> in GTK+ 2.10 it is finally
possible to use rubberband selection in Thunar's detailed view.

<center><img alt="Rubberband Selection" src="/images/2006/preview-0.4.0rc1/rubberbanding.png" /></center>

Unfortunately that didn't work as smooth as it should, so there was some additional work put
into <code>ExoTreeView</code> to be able to really use the rubberband selection with GTKs own
Drag'n'Drop mechanism! With the work-arounds in place you can now start a rubberband selection
in the detailed list view by pressing the left mouse button on a not selected row (it still not
possible to start the rubberband selection in an empty area of the detailed list view and there's
unfortunately no way to work-around this <code>GtkTreeView</code> bug, but hopefully this will
be fixed in one of the next GTK+ releases).


## Creating Launchers the Easy Way

With exo 0.3.1.10rc1 it will be even easier to create launchers for applications on your system,
that are registered via the <a
href="http://freedesktop.org/wiki/Standards_2fmenu_2dspec">freedesktop.org menu system</a>. No
need to look up the name of the binary for the application and search through large icon
directories to locate the appropriate icon for the application anymore. Just start typing the
name of the application or the applications purpose in the <b><u>N</u>ame</b> box and a list of
possible applications with that name or purpose will appear.

<center><img alt="Creating Launchers" src="/images/2006/preview-0.4.0rc1/easy-launcher-creation.png" /></center>

Select the application you are looking for from the list of matching applications and all the
required values are filled with the applications settings.


## Bugfixes and Improvements

Of course this release will also include a bunch of bugfixes and improvements. For example when
selecting an image file in Thunar, the statustext will also include the dimensions of that image,
so you don't need to fire up the properties dialog to find out the width and height of the image.

The dependency of the <code>thunar-vfs</code> library on GConf is gone and startup time was
thereby improved (actually not the startup that much, but the time when the first thumbnail is
loaded). The GNOME thumbnail generators (i.e. Evince for PDF, Totem for video, etc.) are now
collected by an external utility and stored into an <code>mmap()</code>able cache file.

File dates - the time of the last access and modification - are now displayed in a more human
readable format. The overall memory usage was again decreased by using the new slice allocator
in GLib 2.10 and above where appropriate.


## How to contribute?

Thunar - and other Xfce components as well - is still looking for contributions, may it be
knowledge, time or money. If you feel like donating any of this to Thunar, visit the <a
href="http://thunar.xfce.org/contribute.html">Contribute to Thunar</a> page and be sure to
subscribe to the <a href="http://foo-projects.org/mailman/listinfo/thunar-dev">thunar-dev</a> 
mailinglist.


## Feedback

Please send your feedback to the <a
href="http://foo-projects.org/mailman/listinfo/thunar-dev">thunar-dev</a> mailinglist.

