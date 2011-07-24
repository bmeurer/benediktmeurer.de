---
layout: githubproject
title: BMKit
description: Collection of various useful Objective-C classes and categories
github: BMKit
copyright: 2004-2011
---


## About

BMKit is a collection of useful Objective-C classes and categories for iOS (and Mac) development, that I wrote in the past. I'm currently collecting and cleaning up the various bits and pieces, in order to stuff them into BMKit.

Right now, BMKit is a static library for iOS 4.0 and beyond.


## Documentation

Documentation is done using [AppleDoc](http://github.com/tomaz/appledoc).


## License

BMKit is licensed under the [Simplified BSD License](http://en.wikipedia.org/wiki/BSD_license).
See the [LICENSE](http://github.com/bmeurer/BMKit/raw/master/LICENSE) file for details.


## Installation

* Clone the repository via `git clone git://github.com/bmeurer/BMKit.git`.
* In Xcode, add the `BMKit.xcodeproj` to your project or workspace.
* In the build phases of a target, add `libBMKit.a` to the _Target Dependencies_ and _Link Binary with Libraries_.
* In the build phases of a target, add the `ImageIO.framework`, `MobileCoreServices.framework` and `SystemConfiguration.framework` frameworks. to the _Link Binary with Libraries_.
* In the build settings, change _Other Linker Flags_ to `-ObjC -all_load` and _Header Search Paths_ to `$(BUILT_PRODUCTS_DIR)/../BMKit/**`.
* Include the header file using `#import <BMKit/BMKit.h>`.

