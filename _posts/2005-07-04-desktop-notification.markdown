---
layout: post
title: Desktop notification
tags: [gnome]
---

Really, I don't get this. The <a href="http://blogs.gnome.org/view/rodrigo/2005/07/04/0">GNOME guys</a> started the <a href="http://svn.galago.info/trunk/libnotify/">libnotify</a> integration (once again?), which lead to controversial discussion.

I wonder why things have to be that complicated all the time. Why not simply design a desktop notification system based on the ideas used in system notification - namely <code>syslog</code>. Speaking from the flexibility's point-of-view. You have different, pre-defined levels of importance. And you have various services, like Thunderbird or the battery monitor, that want to present notifications. Now the user can choose based on the level and the service, how to present the notification (e.g. popup notification for events from the battery monitor, and simple, non-disturbing, systray notification for Thunderbird events). All events will be logged and it's possible for the user to access/clear this log. In addition, you could allow the services to <i>tag</i> their messages using simple strings. For example with an instant messenger, if you're only interested about online/offline popup notifications about your friend Harry, you'd add a rule to the notification server saying it should display a popup for notifications tagged with <code>"online-state-changed", "Harry"</code>. For easier usage, the notification server should allow its connected services to also modify certain settings. So, all the user would need to do is to right-click on Harry's buddy icon and toggle <b>Tell me when Harry is online/offline</b>.

Of course, sane defaults should be choosen for the different services. Services would need to install an XML (or whatever) file to tell the notification server what they do, which events they provide and whats the default way of notification.

This way you'll have a very flexible, but yet easy to use system. The average user will probably just stay with the (sane) defaults, while the more advanced users will reconfigure certain aspects. And the logging of the events ensures that you don't miss events while you're away.

Does KISS mean nothing in today's open source world?

