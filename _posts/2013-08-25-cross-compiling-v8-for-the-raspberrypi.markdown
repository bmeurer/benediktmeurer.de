---
layout: post
title: Cross-compiling V8 for the Raspberry Pi
tags: [v8, raspberrpi]
---

The [Raspberry Pi](http://www.raspberrypi.org) is probably the most popular Linux ARM device nowadays (not including the ARM based Android smartphones and tablets) and [V8](http://v8.googlecode.com) is the most popular JavaScript engine, so chances are you may want to run (a recent version of) V8 on the Raspberry Pi. Building on the device is an option, but that takes ages. So you will probably want to cross-compile V8 on your powerful Linux workstation instead.

To do this for [Raspbian](http://www.raspbian.org), you'll need to install the [cross-compile toolchain](https://github.com/raspberrypi/tools) first (see [this guide](http://hertaville.com/2012/09/28/development-environment-raspberry-pi-cross-compiler) for detailed instructions). Assuming that you installed the tools to `$HOME/Applications/rpi/tools`, run the following command from your V8 checkout:

{% highlight console %}
$ make CXX="$HOME/Applications/rpi/tools/arm-bcm2708/gcc-linaro-arm-linux-gnueabihf-raspbian/bin/arm-linux-gnueabihf-g++" LINK="$HOME/Applications/rpi/tools/arm-bcm2708/gcc-linaro-arm-linux-gnueabihf-raspbian/bin/arm-linux-gnueabihf-g++" armv7=false armfloatabi=hard arm
{% endhighlight %}

This will build a debug version of the V8 shell in `out/arm.debug/d8` and a release version in `out/arm.release/d8`.
