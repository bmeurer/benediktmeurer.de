---
layout: post
title: Volume Manager
---

After spending some time improving the ThunarVfsURI internals (handling schemes other than <code>file://</code>, performance improvements and the like), I took the time to refine the basic requirements for the volume manager. The volume manager provides core functionality required for the trash system to work (esp. since my current plan for 1.0 excludes trashing to the *"home trash"* as fallback).

From the high-level view, the volume manager module looks pretty simple:

<a href="/images/2005/thunar-vfs-volumes-20050611.png"><img src="/images/2005/thunar-vfs-volumes-20050611.png" width="90%" /></a>

The main goal is to provide a small interface, to support many different backends, but still includes all the functionality required for the upper layers. Back in 2003, I rewrote the core of the fstab plugin for xffm with support for many different platforms, so the basic code (which now also includes a few bugfixes) is there. We could also add HAL support later, but since HAL is only supported on Linux and isn't widely used currently, this has very low priority (maybe even a TODO item for Thunar 2.0).

The important work for now is to define an interface to the volume manager, that allows the trash system to query the list of active trash cans (and also get notified once a new trash can is online) and the favourites view to display the list of removable devices. The favourites view also requires the ability to mount and umount/eject devices.

By the way, I'm looking for a term to describe the "eject/umount" action in the GUI. While "eject" is fine for CDs, it's simply wrong for other removable media types, such as floppies or usb sticks - imagine an USB slot with the ability to fire off usb sticks. ;-)

