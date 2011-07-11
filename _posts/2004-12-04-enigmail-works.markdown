--- 
layout: post
title: Enigmail works
tags: [netbsd, enigmail, mozilla, gnupg]
---

I finally got [EnigMail](http://enigmail.mozdev.org) working with native Mozilla on
NetBSD/i386 -current (latest Mozilla 1.5.1 from [pkgsrc](http://www.pkgsrc.org) with
enigmail 0.82.2). I uploaded the XPI files <a
href="ftp://ftp.unix-ag.org/user/bmeurer/NetBSD/Mozilla-1.5.1/Enigmail/">here</a>.
To install the XPI files, run Mozilla as root, open the directory that
contains the three XPI files in the browser and click on the files to
install them, in the following order: The IPC module, the enigmime
package and finally the enigmail package. Finally start Mozilla and
configure enigmail as mentioned on the [EnigMail](http://enigmail.mozdev.org) website.

