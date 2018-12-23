---
title: Major changes in Xfce 4.4 BETA1
tags: xfce
---

As you might already know, Xfce 4.4BETA1 was released today, and it contains a lot of changes, that have been worked since the last major release. I'm going to present an (incomplete!) list of the most important changes in BETA1. I will not include Thunar here, read the <a href="http://thunar.xfce.org/news.html#2006-04-16">Thunar 0.3.0 release notes</a> for details about Thunar

## Desktop Icons

One of the most often requested features during the Xfce 4.0/4.2 days was support for desktop icons. Xfce 4.4 finally includes support for icons on the desktop.

<center><a href="/images/2006/xfce-4.4beta1-changes/desktop-icons.png"><img src="/images/2006/xfce-4.4beta1-changes/desktop-icons-thumb.png" /></a></center>

xfdesktop utilizes Thunar's libraries to handle application launchers and files/folders on the desktop, and it is also able to display icons for minimized windows on the desktop (a popular CDE feature), or to disable desktop icons all together.

## Mousepad

Mousepad, a simple and lightweight text editor, was included as part of Xfce 4.4. Mousepad starts up very fast and provides all the basic text editing features, which makes it a perfect default editor for Xfce.

<center><a href="/images/2006/xfce-4.4beta1-changes/mousepad.png"><img src="/images/2006/xfce-4.4beta1-changes/mousepad-thumb.png" /></a></center>

## Orage

Orage, the new calendar application based on xfcalendar, provides all the features one would expect from a time management application today, while it remains lightweight and easy to use.

<center><a href="/images/2006/xfce-4.4beta1-changes/orage.png"><img src="/images/2006/xfce-4.4beta1-changes/orage-thumb.png" /></a></center>

## Panel

The Xfce Panel was completely rewritten for 4.4, and supports multiple panels and external plugins (running as separate applications and thereby improving the stability of the panel). xftaskbar4 and xfce4-iconbox were dropped from the release, as their functionality is completely provided by the new panel now.

<center><a href="/images/2006/xfce-4.4beta1-changes/panel-properties.png"><img src="/images/2006/xfce-4.4beta1-changes/panel-properties-thumb.png" /></a></center>

The panel items can now be added and reordered using Drag'n'Drop, and the panel launcher properties dialog was redesigned to make it easier to create and manage launchers with attached menus (there is also support for <a href="http://rox.sourceforge.net/desktop/node/269">Zero Install</a> now).

<center><a href="/images/2006/xfce-4.4beta1-changes/panel-launcher.png"><img src="/images/2006/xfce-4.4beta1-changes/panel-launcher-thumb.png" /></a></center>

Most of the panel plugins, available via the <a href="http://xfce-goodies.berlios.de/">Xfce Goodies</a> project, have been updated for the new panel, and the new <code>xfce4-xfapplet-plugin</code> allows users to add GNOME panel applets to the Xfce panel.

## Preferred Applications

A new preferred applications framework was imported into Xfce, so users no longer need to edit shell profiles to specify which browser and terminal emulator should be used by Xfce applications.

<center><a href="/images/2006/xfce-4.4beta1-changes/preferred-applications.png"><img src="/images/2006/xfce-4.4beta1-changes/preferred-applications-thumb.png" /></a></center>

## Window Manager Tweaks

<code>xfwm4</code>, the Xfce window manager, saw a lot of improvements. One of the most interesting user-visible changes is the inclusion of a window manager tweaks dialog, which allows users to tweak several advanced options of the window manager.

<center><a href="/images/2006/xfce-4.4beta1-changes/wmtweaks.png"><img src="/images/2006/xfce-4.4beta1-changes/wmtweaks-thumb.png" /></a></center>

There is also support to tweak the builtin composition manager in the window manager settings if <code>xfwm4</code> was built with support for the Xcomposite extension.

This is just a very brief list of changes. A more complete review of Xfce 4.4BETA1 should be available during the next weeks.
