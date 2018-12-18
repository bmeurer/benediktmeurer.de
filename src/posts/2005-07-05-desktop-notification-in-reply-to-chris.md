---
layout: post
title: Desktop notification (in reply to Chris)
---

In reply to <a href="http://www.chipx86.com/">Christian</a>'s comment on my last blog entry:

I read the <a href="http://www.galago.info/specs/notification/0.6/t1.html">spec</a> right before writing the blog entry, and I basicly followed the discussion on xdg-list earlier.

The spec covers some basics. But from my point of view, the focus of the <i>reference implementation</i> and the spec is wrong.

First of all, your reference implementation is the most important point for now, simply because that's what people see. You could write a perfect spec, people will always check your reference implementation first. So all oddities (really mainly the odds, not the bugs) will affect the acceptance of the spec. My feeling is that Galago is currently trying to catch people with those nice popup effects seen on other operating systems - but I don't follow that project very closely, so I may be wrong here. Still it is a problem for your project if developers (and users) see your project as <i>eye-candy</i> only.

Then, back on topic, the filtering issue. You really want to do filtering on the daemon side, because else if the client would filter events, those would never show up in the event log. And besides that, this is the only way to ensure that all the filter information is managed and stored in a single place. But to be able to allow useful and flexible filtering in the daemon, the client must provide as much data as possible. And in order to allow easy configuration, the client must also provide information about the <i>filter tags</i>.

The spec currently provides two tags for filtering: The notification type id and the urgency level (I'd strongly suggest to provide more than 3 levels by default). The application name is pretty useless, as the spec explicitly states that this should be the formal name rather than a unique id. And formal names are not garantied to be unique and may change over time. The notification type id is a single string and thereby not suitable for non-trivial filtering. E.g. I can only say, that I'd interested to know whenever an IM buddy goes online. I cannot say <b>Tell me when Harry goes online</b> (sure, you could use something weird like <code>im.user.harry.online</code>, but that's really only a work-around for a limitation in the system). Two criterions are simply not enough to perform useful filtering.

Then, the configuration issue: If you want to do filtering in the daemon (and you really want to do this if you plan to support event logging), then there must be a way for clients to tell the daemon about the different <i>filter tags</i> and the default settings, and at best also an interface to allow clients to change the settings easily. I proposed to use a simple XML file here, installed by every client that supports desktop notification, but that was just a suggestion, you could use any other file format. The file name would somehow include the application's unique id. You would also store thinks like the application icon and the sounds to play for a specific event and such within this file, which allows integration with desktop wide sound themes, etc.

What really bugs me about the spec and the way this is started in GNOME currently is the fact that important issues like filtering get nearly no attention, but instead the focus is on minor details like the appearance (esp. since the spec explicitly states that <i>"applications can generate passive popups"</i>, which somehow makes it less suitable for a general desktop notification spec). I'd welcome if people would focus on the important parts first, and don't focus too much on details like how to display the messages (and there should be really more than one way to display notifications, atleast something non-disturbing like an icon in the systray).

Note that these are just my 2 cents. I'm not an expert in desktop notification, nor do I have any time or interested to work on the spec or the implementation (well, maybe an implementation for Xfce, once there's a usable spec, but not this year). So you may disregard my comments silently. But I really strongly recommend to revise the spec, because else I'm pretty sure, this won't be the standard for a long time.
