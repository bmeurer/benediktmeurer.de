---
layout: post
title: How to uncrush pngcrushed images from an iOS App Bundle
---

I recently had to restore some PNG files from an iOS App Bundle, which apparently did not work very well, since they have been compressed automatically using Apple's version of [pngcrush](http://pmt.sourceforge.net/pngcrush/) when they were copied to the App Bundle folder during archiving. Fortunately it's quite easy to revert the optimizations using the following command (assuming you have installed the Apple Developer Tools and the iOS SDK):

```
$ mkdir ~/reverted
$ /Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/pngcrush -dir ~/reverted -revert-iphone-optimizations -q *.png
```

This will create a folder `reverted` in your home directory with the uncrushed PNG files.
