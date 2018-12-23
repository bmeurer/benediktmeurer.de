---
title: Location buttons
tags: thunar
---

People tend to prefer pictures, so screenshot first:

<a href="/images/2005/thunar-devel-20050608.png"><img src="/images/2005/thunar-devel-20050608.png" width="90%" /></a>

On the informative side, I redefined the basic UI interfaces, and now all navigational UI elements in a ThunarWindow will implement the ThunarNavigator interface. In addition, there are separate interfaces for elements that can be placed in the side pane and for elements that provide a location bar. This makes support for plugins in this area very easy. The main view does not implement ThunarNavigator currently, because it needs special treatment to get proper error handling (e.g. if a user tries to enter a directory, which he's not allowed to enter, the window should display an error message and fallback to another directory, and this must be performed by exactly one module, the ThunarWindow, and so the ThunarWindow must perform the initial opendir on the folder). In addition, there must be async error support for the main view to properly support error handling with the ThunarVfsMonitor module.
