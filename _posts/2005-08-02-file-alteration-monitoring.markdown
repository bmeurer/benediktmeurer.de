---
layout: post
title: File alteration monitoring
tags: [xfce, thunar]
---

Just committed a change to get file alteration monitoring working again in Thunar. I had more or less carefully evaluated the possibilities of doing the monitoring within the Thunar process, using a combination of various <i>backends</i>:

* kevent (this was already in the first prototypes)
* dnotify
* inotify
* regular stating in the main thread
* regular stating in a separate thread

But every solution I could think of would add way too much complexity to Thunar with no real gain. So the monitoring will now be done solely by FAM or Gamin. I strongly recommend Gamin, because it offers several advantages over FAM:

* Can utilize various modern operating system services like kevent and inotify.
* Allows its client to disable the sending of FAMExists events, which aren't used in Thunar (nor in any other FAM-based software I've seen recently) and produce only unnecessary noise.
* Runs as user process rather than system service.

On the other hand, if you use NFS mounted home directories, you should better stay with FAM for now.

For people that don't like file monitoring, just disable FAM/Gamin (or just don't install it) and Thunar will run without monitoring. The Thunar-VFS jobs will provide feedback to the monitor whenever they perform an action on the filesystem, so you should be able to work with the file manager even if you don't have FAM/Gamin, without the need to reload the folder manually after copying/moving/deleting files. ;-)

