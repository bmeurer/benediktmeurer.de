---
layout: post
title: arm-linux-gnueabi cross compiler for OS X
---

I spent some time getting a decent cross compiler toolchain for `arm-linux-gnueabi` running on Mac OS X, including GNU binutils 2.22, gcc 4.6.2 and OCaml 3.12.1. The cross compiler toolchain targets ARM boards running Debian/armel squeeze or later.

The stuff is available from my [local MacPorts repository](https://github.com/bmeurer/MacPorts). To get it working on your Mac, make sure to update to the latest MacPorts first, using:

```
sudo port selfupdate
sudo port upgrade outdated
```

Continue by cloning my MacPorts repository and editing the MacPorts `sources.conf` file (as superuser):

```
git clone git://github.com/bmeurer/MacPorts.git
cd MacPorts/ports
sudo vim /opt/local/etc/macports/sources.conf
```

Add a new line to the file *before* the line with the `[default]` tag

```
file:///path/to/MacPorts/ports [nosync]
```

where `/path/to/MacPorts` is the path to the MacPorts repository clone. Once done, run

```
portindex
```

in the `MacPorts/ports` subdirectory to add the ports from my local MacPorts repository to the list of available ports (remember to rerun `portindex` everytime you pull from my repository). Now you can continue installing the cross compiler ports, using either

```
sudo port install arm-linux-gnueabi-gcc
```

to install just the binutils, gcc and the basic runtime, or

```
sudo port install arm-linux-gnueabi-ocaml-compiler
```

to also install the OCaml cross compiler and its runtime. Installing the toolchain will take some time depending on the available bandwidth and the overall speed of your machine.

Once done, your new cross compiler will be ready in `/opt/local`, with its system root in `/opt/local/arm-linux-gnueabi/sysroot` and related tools in `/opt/local/bin`, prefixed with `arm-linux-gnueabi-`, i.e.

```
$ arm-linux-gnueabi-as --version
GNU assembler (MacPorts 2011/12/02) 2.22
Copyright 2011 Free Software Foundation, Inc.
This program is free software; you may redistribute it under the terms of
the GNU General Public License version 3 or later.
This program has absolutely no warranty.
This assembler was configured for a target of `arm-linux-gnueabi'.

$ arm-linux-gnueabi-gcc --version
arm-linux-gnueabi-gcc (MacPorts 2011/12/02) 4.6.2
Copyright (C) 2011 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

$ arm-linux-gnueabi-ocamlopt -config
version: 3.12.1
standard_library_default: /opt/local/arm-linux-gnueabi/sysroot/usr/lib/ocaml
standard_library: /opt/local/arm-linux-gnueabi/sysroot/usr/lib/ocaml
standard_runtime: /opt/local/arm-linux-gnueabi/bin/ocamlrun
ccomp_type: cc
bytecomp_c_compiler: arm-linux-gnueabi-gcc -fno-defer-pop -Wall -D_FILE_OFFSET_BITS=64 -D_REENTRANT -fPIC
bytecomp_c_libraries: -lm  -ldl -ltermcap -lpthread
native_c_compiler: arm-linux-gnueabi-gcc -Wall -D_FILE_OFFSET_BITS=64 -D_REENTRANT
native_c_libraries: -lm  -ldl
native_pack_linker: arm-linux-gnueabi-ld -r  -o
ranlib: arm-linux-gnueabi-ranlib
cc_profile: -pg
architecture: arm
model: default
system: linux
asm: arm-linux-gnueabi-as
ext_obj: .o
ext_asm: .s
ext_lib: .a
ext_dll: .so
os_type: Unix
default_executable_name: a.out
systhread_supported: true
```

To help with cross compilation of OCaml projects using `ocamlfind`, the `arm-linux-gnueabi-ocaml-compiler` port also installs a custom `ocamlfind` configuration file `/opt/local/etc/arm-linux-gnueabi-ocamlfind.conf`, which you can use to utilize the cross compiler toolchain by setting the environment variable `OCAMLFIND_CONF` to point to this file.
