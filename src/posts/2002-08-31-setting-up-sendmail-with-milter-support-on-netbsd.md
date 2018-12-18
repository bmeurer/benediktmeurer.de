---
layout: post
title: Setting up sendmail with Milter support on NetBSD
---

Note that if you are using NetBSD 1.6T or better, the
system sendmail already supports the Milter library. And pkgsrc
supports sendmail installation (for 8.12.x, 8.12.9 at this
moment) linked with Milter library. See mail/libmilter and
mail/sendmail (use <code>make USE*MILTER=yes</code> command to
build the last one).
*(Thanks to Mishka for pointing this out)\_

This is a posting from <a href="mailto:mishka@batraq.anything3d.com">Mishka</a>
to comp.unix.bsd.netbsd.misc on getting sendmail to work with libmilter using the <a
href="ftp://ftp.netbsd.org/pub/NetBSD/NetBSD-current/pkgsrc/devel/pth/README.html">devel/pth</a>
package:

```
From: Mishka &lt;mishka@batraq.anything3d.com&gt;
Newsgroups: comp.unix.bsd.netbsd.misc
Subject: NetBSD + Milter = friendship :)
Date: Fri, 30 Aug 2002 18:12:49 +0300
Organization: PACOnet ISP
Message-ID: &lt;3D6F8B71.4050807@batraq.anything3d.com&gt;
X-Complaints-To: abuse@paco.net
NNTP-Posting-Date: Fri, 30 Aug 2002 15:13:42 +0000 (UTC)
User-Agent: Mozilla/5.0 (X11; U; NetBSD i386; en-US; rv:1.0.0) Gecko/20020816
X-Accept-Language: en-us, ru
X-NNTP-Posting-Host: batraq.anything3d.com

Hello!

I found that built-in sendmail (8.11.6 for NetBSD 1.6E) compiled without
Milter support. Next, in pkgsrc collection sendmail have the same version,
and have not Milter support also. It seems to be due to absence of POSIX
threads in system.

Anobody knows rightest way to enable Milter functionality in Sendmail?
It would be great if we can solve this problem without install other
version of sendmail, but use built-in one.

Having installed pth-1.4.1 before, I tried the following:

1) Add the following files and dir to /usr/src/gnu/usr.sbin/sendmail:
  libmilter/
  libmilter/Makefile
  libmilter/Makefile.milter

    With following contents:
  ---- libmilter/Makefile.milter BEGIN ----
  # $NetBSD$

  .if _FFR_MILTER
  PTH_CFLAGS!=    pth-config --cflags
  PTH_LDFLAGS!=   pth-config --ldflags
  PTH_LIBS!=      pth-config --libs

  CPPFLAGS+=      -D_FFR_MILTER
  CPPFLAGS+=      ${PTH_CFLAGS}
  LDADD+=         ${PTH_LDFLAGS} ${PTH_LIBS}
  .endif
  ---- libmilter/Makefile.milter END ----

  ---- libmilter/Makefile BEGIN (derived from libsmutil/Makefile) ----
  #       $NetBSD: Makefile,v 1.4 2001/12/12 12:24:21 lukem Exp $

  NOSHARE=        # defined
  NOPIC=          # defined
  NOPROFILE=      # defined

  .include &lt;bsd.own.mk&gt;
  .include "Makefile.milter"

  DIST=           ${.CURDIR}/../../../dist
  .PATH: ${DIST}/sendmail/libmilter

  LIB=            milter

  CPPFLAGS+=      -DNOT_SENDMAIL

  SRCS=           comm.c engine.c handler.c listener.c
  SRCS+=          main.c signal.c sm_gethost.c smfi.c

  libinstall::

  .include &lt;bsd.lib.mk&gt;
  ---- libmilter/Makefile BEGIN ----

    And have added the following line to Makefile:

  .include "libmilter/Makefile.milter"

2) Next, having installed libmilter/Makefile.milter I do:

  # pwd
  /usr/src/gnu/usr.sbin/sendmail
  # make clean
  ...
  # make -f Makefile -D_FFR_MILTER
  ...
  . at this stage i seen that libsmutil and other is compiled
  . with _FFR_MILTER flags and linked with -lpth
  ...
  # make install
  ...
  # ldd /usr/libexec/sendmail/sendmail
  /usr/libexec/sendmail/sendmail:
           -lwrap.0 =&gt; /usr/lib/libwrap.so.0
           -lutil.6 =&gt; /usr/lib/libutil.so.6
           -lssl.2 =&gt; /usr/lib/libssl.so.2
           -lcrypto.1 =&gt; /usr/lib/libcrypto.so.1
           -lpth.14 =&gt; /usr/pkg/lib/libpth.so.14     &lt;--- look here
           -lc.12 =&gt; /usr/lib/libc.so.12
  # cd libmilter &amp;&amp; make -D_FFR_MILTER
  ...
  # cp libmilter.a /usr/lib
  # ns -s /usr/lib/libmilter.asmfi_getpriv in smfi.o
  smfi_addrcpt in smfi.o
  smfi_addheader in smfi.o
  smfi_getsymval in smfi.o
  ... and so on ...

3) After two ones below, I have sucessfully compiled sample mail filter
    which uses libmilter library.

4) After all, I have added following lines to /etc/mail/sendmail.rc:

  O InputMailFilters=drweb-filter
  Xdrweb-filter,  S=inet:3001@localhost,  T=S:10m;R:10m;E:1h

    And errors for this moment wasn't detected :)

But i have ask you once more: is there exists more easiest way to do this,
and anybody know what we will do if some package uses Milter functionality?
(maybe syspkg ;)

Thanks in advance.

--
Mishka.
```
