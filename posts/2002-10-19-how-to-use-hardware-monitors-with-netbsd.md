---
layout: post
title: How to use hardware monitors with NetBSD
---

Today, there are various environmental sensor ICs available on modern mainboards, which are able of monitoring fan speed,
cpu and system temperature, and voltage for example. NetBSD currently supports the National Semiconductor LM78, LM79 and compatible 
hardware monitors (the <a href="http://www.tac.eu.org/cgi-bin/man-cgi?lm+4+NetBSD-current">lm(4)</a> device), the VIA VT82C686A hardware
monitor (the <a href="http://www.tac.eu.org/cgi-bin/man-cgi?viaenv+4+NetBSD-current">viaenv(4)</a> device) and ACPI aware hardware
monitors (the <a href="http://www.tac.eu.org/cgi-bin/man-cgi?acpi+4+NetBSD-current">acpi(4)</a> subsystem) through its <a
href="http://www.tac.eu.org/cgi-bin/man-cgi?envsys+4+NetBSD-current">Environmental Systems API</a>. These devices are not enabled
by default, you need to <a href="http://www.mclink.it/personal/MG2508/nbsdeng/chap-kernel.html">recompile your kernel</a> with the
following additional lines in your kernel config file:

For the National Semiconductor LM78, LM79 and compatible monitors (you may need to adjust the I/O port settings):

```
lm0 at isa? port 0x290
```

For the VIA VT82C686A hardware monitor:

```
viapm* at pci? dev ? function ?
viaenv* at viapm?
```

For ACPI enabled monitors (thanks to <a href="mailto:joel@carnat.net">Joel Carnat</a> for the hint):

```
options MPACPI
acpi0 at mainbus0
acpiacad at acpi?
acpibat* at acpi?
acpibut* at acpi?
acpiec* at acpi?
acpilid* at acpi?
acpitz* at acpi?
```

After booting your new kernel, you can access your hardware sensors, using the <a
href="http://www.tac.eu.org/cgi-bin/man-cgi?envstat+8+NetBSD-current">envstat(8)</a> command. For example, to display
all supported sensors, type <code>envstat -l</code>, and to actually read the environmental sensors, simply type
<code>envstat</code>. For more information about using the <a href="http://www.tac.eu.org/cgi-bin/man-cgi?envstat+8+NetBSD-current">envstat(8)</a> tool, refer to the manpage.
