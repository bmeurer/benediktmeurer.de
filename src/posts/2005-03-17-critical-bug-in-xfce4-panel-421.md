---
title: Critical bug in xfce4-panel 4.2.1
tags: xfce
---

The xfce4-panel in the latest Xfce 4.2.1 release contains a bug: It does not save its configuration on session logout. The <a href="http://os-works.com/view/debian/">Xfce Debian package</a> already contains a fix for this bug, so you don't need to worry about it. If you have installed from the graphical installer or plan to install from the <a href="http://xfce-installer.os-cillation.com/">graphical installer</a>, follow these steps to fix the bug:

<ol>   <li>Download the <a href="http://www.os-cillation.de/download.php?file=xfce4-4.2.1-installer.bin">xfce4-4.2.1-installer.bin</a> (if not already done)</li>   <li>Mark the file executable using <tt>chmod +x xfce4-4.2.1-installer.bin</tt></li>   <li>Download the file <a href="/files/patches/xfce4-panel-4.2.1-store-config.patch">xfce4-panel-4.2.1-store-config.patch</a></li><li>Download the file <a href="/files/patches/xfce4-session-4.2.1-mcs-manager-crash.patch">xfce4-session-4.2.1-mcs-manager-crash.patch</a>
</li> <li><tt>./xfce4-4.2.1-installer.bin --extract-only</tt></li>   <li><tt>cd /tmp/xfce4-4.2.1-installer/xfce4-panel</tt></li>   <li><tt>patch -Np1 &lt; /path/to/xfce4-panel-4.2.1-store-config.patch</tt></li><li><tt>cd ../xfce4-session</tt></li>   <li><tt>patch -Np0 &lt; /path/to/xfce4-session-4.2.1-mcs-manager-crash.patch</tt></li>   <li><tt>cd ..
</tt></li>   <li><tt>./bootstrap.sh</tt></li>   </ol>This also fixes a possible crash in xfce4-session when testing a splash engine. Now follow the usual installation instructions from the <a href="http://www.os-cillation.com/documentation/installers/xfce-installer/">installer documentation</a>.

In case, you installed Xfce 4.2.1 from source, untar the <tt>xfce4-panel-4.2.1.tar.gz</tt> file again, download the patch <a href="/files/patches/xfce4-panel-4.2.1-store-config.patch">xfce4-panel-4.2.1-store-config.patch</a>, <tt>cd xfce4-panel-4.2.1</tt>, <tt>patch -Np1 &lt; /path/to/xfce4-panel-4.2.1-store-config.patch</tt> and afterwards run configure, make and make install as usual.

## Update

<a href="/2005/03/18/xfce-4211-available">Xfce 4.2.1.1 available</a>.
