---
layout: post
title: Transparent Terminal Hack
tags: [xfce, terminal]
---

This one was requested quite often lately, so here's a quick&dirty hack to make the Terminal transparent. The Terminal-side changes are pretty easy, just use ARGB visuals if possible. The VTE patch is really just a hack for the Xft backend with a hardcoded alpha value of <code>0xaaaa</code>. You need to run a composition manager for this to work (i.e. <code>xfwm4</code> with <code>--compositor=on</code>), and select solid background color in Terminal (as said, the VTE patch is just a really quick hack). The result is:

<center><a href="/images/2006/terminal-transparent.png"><img src="/images/2006/terminal-transparent.png" width="400" /></a></center>

<ul>
<li><a href="/files/patches/transparent-hack-Terminal.patch">Patch for Terminal</a>, works with latest SVN.</li>
<li><a href="/files/patches/transparent-hack-VTE.patch">Patch for VTE</a>, created with 0.11.18, but should also work with newer versions.</li>
</ul>

Anybody willing to create a clean patch for VTE (requires quite a lot of changes, but doable)?

