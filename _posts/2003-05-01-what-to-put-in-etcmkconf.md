---
layout: post
title: What to put in /etc/mk.conf
---

In order to get a sane build environment and to build sane packages out of your environment, you should consider overriding some default
values in your `/etc/mk.conf`. For example, if you are running NetBSD/alpha, you shouldn't use any optimizations to
[cc(1)](http://www.tac.eu.org/cgi-bin/man-cgi?cc+1+NetBSD-current), because
gcc is still buggy on Alpha. And in general you should think twice before setting the optimization level above 2, because this might cause
several programs to segfault frequently or not run at all. Here are some lines from my `mk.conf`, which might help you
(they will honor all default values but -ON):

```make
COMMONCFLAGS?=-O2 -pipe
COPTS:=${COMMONCFLAGS} ${COPTS:C/-O[0-9]*//g}
CFLAGS:=${COMMONCFLAGS} ${CFLAGS:C/-O[0-9]*//g}
CXXFLAGS:=${COMMONCFLAGS} ${CXXFLAGS:C/-O[0-9]*//g}
```

When trying to fix bugs in packages, it is helpful to append `-Wall -Werror` to `COMMONCFLAGS`, but beware: This might
break a lot of configure scripts (so, you have the chance to fix them too ;-). Another needful thing to have in your `mk.conf` is support
for [sudo](ftp://ftp.netbsd.org/pub/NetBSD-current/pkgsrc/security/sudo/README.html) instead of the default
[su(1)](http://www.tac.eu.org/cgi-bin/man-cgi?su+1+NetBSD-current), so you may need not to type the root password everytime you install a
package as a user. Here are the lines from my `mk.conf`:

```make
.if exists(/usr/pkg/bin/sudo)
SU_CMD=/usr/pkg/bin/sudo /bin/sh -c
.endif
```

Another helpful thing to do, is to override the default `MASTER_SITE` with faster (local) mirrors. E.g. I have a local NetBSD mirror
(thats the `tatooine.kosmos.all` line, so don't simply copy&paste to your `mk.conf` :-),
from where pkgsrc should try to fetch the needed distfiles first and after that fails, it will try several other mirrors, and only if a distfile cannot
be found there, it'll try to fetch it from the `MASTER_SITE`s specified for the package. Here are the lines from my `mk.conf`:

```make
MASTER_SITE_OVERRIDE+= \
  ftp://tatooine.kosmos.all/pub/NetBSD/packages/distfiles/ \
  ftp://ftp.de.netbsd.org/pub/NetBSD/packages/distfiles/ \
  ftp://ftp2.de.netbsd.org/pub/NetBSD/packages/distfiles/ \
  ftp://ftp.at.netbsd.org/pub/NetBSD/packages/distfiles/ \
  ftp://ftp.netbsd.org/pub/NetBSD/packages/distfiles/
```
