--- 
layout: post
title: Why NetBSD?
tags: [netbsd]
---

During the last years, I used to install a lot of different operating systems, looking for the
system that fits my needs best. For example, I tried Microsoft Windows NT (3.51, 4.0 and 5.0
and had a quick look at 5.1), several Linux distributions (e.g.
[SuSE Linux](http://www.suse.com), [RedHat Linux](http://www.redhat.com),
[Debian GNU/Linux](http://www.debian.org) and [Mandrake Linux](http://www.mandrake.com)),
[FreeBSD](http://www.freebsd.org) and [OpenBSD](http://www.openbsd.org). We also tried to write
our own operating system (we named it "Socratix"), but soon we noticed, that it was an
impossible task for us to write a whole operating system (from scratch).

All those systems I tried have their particular advantages, but of course they all have their
_native_ disadvantages. And not allowing me to fix these disadvantages (e.g. the Debian Policy
is such a disadvantage, I think), makes me become very frustrated of open source software (and
the philosophy behind it). So after all, I decided to give [NetBSD](http://www.netbsd.org)
another try (I had installed NetBSD several times before, for testing reasons, but never
get really close to it). After reading [Federico Lupi](http://www.mclink.it/personal/MG2508)'s
excellent [NetBSD Guide](http://www.mclink.it/personal/MG2508/nbsdeng/netbsd.html) I fetched
the NetBSD distribution, created an iso image out of it and burned it onto a cd. Starting off
the very straight-forward installation procedure, I was very pleased with NetBSD. It allows to
me to do exactly what I want to do, nothing more, and nothing less. The base system is very
clean and includes only the main parts of the system, so soon I decided to fetch a recent
<code>pkgsrc.tar.gz</code> and installed some packages (I cannot live without perl ;-). The only
thing I'm still missing about pkgsrc is a tool like portupgrade; it is currently been worked on,
and e.g. `pkg_hack` does nearly everything portupgrade does, but you know
<a href="http://www.netbsd.org/Goals/system.html"><i>It doesn't work <b>unless</b> it's
right</i></a> :-).

After all, I think the main reason for using NetBSD is its clean design and clean development
model. The problem with the mainstream operating systems such as GNU/Linux is that people always
want to have the newest features, and so the main goal is to get this features implemented as
soon as possible, without the need to get a clean implementation. With NetBSD, you may get this
features up to one or two years later, after somebody worked out a clean and stable
implementation and a lot of testing was done on it. And when you get it, you can be sure, it
works! So, now you know, why I prefer NetBSD, and what about you? Are you still loosing time
getting your <a href="http://www.kernel.org/">Linux</a> distribution to work? Tired of
fixing Debian package dependencies everytime you type <code>apt-get dist-upgrade</code>? So,
maybe you should give NetBSD a try, but beware of making the wrong decision: NetBSD is
<b>no</b> mainstream operating system, so if you always want to get the latest (unstable)
features, you're better off not choosing NetBSD to run your computer!

And last but not least: <a href="http://srom.zgp.org/">NetBSD rules</a> :-).

