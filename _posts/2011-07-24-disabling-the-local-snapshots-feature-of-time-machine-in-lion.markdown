---
layout: post
title: Disabling the local snapshots feature of Time Machine in Lion
---

[Local snapshots for Time Machine](http://www.apple.com/macosx/whats-new/features.html#timemachine) is one of the new features in OS X Lion that looks really good on paper. But once you have used your new Lion installation for a few days, you will notice that you are running out of disk space. After some digging around I noticed that the <code>/.MobileBackups</code> folder that is used by Time Machine for local snapshots was at nearly 50GiB, even though the external Time Machine backup disk was connected most of the time. I guess this is done to speedup Time Machine in the common case, and make backups available when not connected to the external Time Machine disk.

Besides the disk space issue, the local snapshots feature also slows down your MBP noticably. You'll notice that the disk is spinning most of the time, and the file copying performed by Time Machine trashes your caches. Everything feels terribly slow after some time. Thankfully Apple engineers included a switch to turn of the local snapshots feature, <code>tmutil</code> supports a new command <code>disablelocal</code> in OS X Lion. Use the following command to disable the local snapshots feature of Time Machine:

{% highlight console %}
$ sudo tmutil disablelocal
{% endhighlight %}

Note that it might take some time for Time Machine to cleanup the <code>/.MobileBackups</code> folder.

