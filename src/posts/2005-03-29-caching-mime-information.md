---
layout: post
title: Caching MIME information
tags: thunar
---

RedHat's Matthias Clasen came up with the idea of caching the MIME information provided by the Shared MIME database (the list of MIME type aliases, subclass information, the glob patterns, the magic patterns and the XML namespaces) in a mmapable file <a href="http://lists.freedesktop.org/archives/xdg/2005-March/006386.html">today</a>. With his attempt, there'll be one cache file (<code>mime.cache</code>) per <code>mime</code> directory, e.g. on most Linux systems, this will be

<ul>   <li><code>/usr/local/share/mime/mime.cache</code></li>   <li><code>/usr/share/mime/mime.cache</code></li>   <li><code>~/.local/share/mime/mime.cache</code></li> </ul> while on for example FreeBSD, this will be
<ul>   <li><code>/usr/X11R6/share/mime/mime.cache</code></li>   <li><code>/usr/local/share/mime/mime.cache</code></li>   <li><code>~/.local/share/mime/mime.cache</code></li> </ul> (both with default <code>$XDG_DATA_DIRS</code> settings). He also provides patches for both <code>xdgmime</code> (the MIME implementation used by <code>gtk+</code> and <code>gnome-vfs</code>) and <code>update-mime-database</code>.

The general idea is good, and the implementation looks good too. We should consider using the cache for Thunar as well. My major concern about this currently is the bad data locality with <b>many</b> <code>mime.cache</code> files (which should only happen if the admin is on crack) and the probably reduced performance due to the big endian to little endian conversions (we need a benchmark here to decide if it's really worth to spend another thought on this conversion). If we'd adopt this idea for Thunar, we could further reduce startup time, as the process would not need to parse the MIME database first, and it would reduce the memory overhead, tho this is less critical in case of Thunar, since all windows (and the desktop background) run in the same process space and thereby share the MIME database.

Anyways, it's nice to see some useful activity on the <code>xdg</code> mailinglist again, after all this <i>discuss it to death</i>-threads about D-VFS and gconf.

<b>Edit:</b> Additional notes can be found in <a href="http://foo-projects.org/pipermail/thunar-dev/2005-March/000468.html">this mail</a>.
