---
layout: post
title: Xfce splash screen crash course
tags: xfce
---

Here's a very brief introduction to the way splash screens work in Xfce 4.2.0 and above:

The whole splash thingy is a bit complex atm. On the first level, there are splash engines (currently <code>mice</code>, <code>simple</code> and <code>balou</code>); these are loadable modules. <code>mice</code> isn't themable at all, everything's hardcoded. <code>simple</code> is themeable from the configure dialog, and <code>balou</code> is themable using a theme file.

<code>balou</code> theming is pretty easy, its just a <code>themerc</code> file and a logo image file. Check the <code>Default</code> balou theme in the xfce4-session source to get an idea of the file format/content (it includes a few comments). To distribute a theme, create a directory layout like this:

```
Name
Name/balou
Name/balou/themerc
Name/balou/logo.png
```

where <code>Name</code> is the name of your theme. Then tar up the stuff like this:

```
$ tar czvf Name.tar.gz Name
```

Now users can simply install the theme by dragging the <code>.tar.gz</code> file from  a file manager and dropping it to the <code>balou</code> configure screen in the  settings manager.

