---
title: Favourites
tags:
  - thunar
  - xfce
---

I have a more or less working prototype for the ThunarFavourites module now (well, it currently works a little bit different from the shortcuts list in GtkFileChooser, but I'm not going to care for that now). You can add favourites using DnD from every DragSource that supports <code>text/uri-list</code> (e.g. from the location buttons or another file manager such as Nautilus), or reorder favourites internally. There's no way to remove favourites currently (except editing <code>~/.gtk-bookmarks</code> manually of course), but that's not important for now. All the low-level stuff in ThunarFavouritesModel is connected properly now. So the next step is to add some more stuff to the ThunarIconView GUI, and then I'll be ready to continue work on the low-level stuff, esp. the VFS Monitor and the trash system (unfortunately nobody volunteered to help with the trash system).

Note that this doesn't mean, that the prototype can do anything useful now; it's just in a state where it can be used to test the underlying modules from the GUI, not only from automated test suites.

On the usability front, Erik and David seem to be serious about the _usability team_ which will be a real win for Thunar - and probably for Xfce as well, tho it was a bit problematic in the past with usability suggestions, the last failed attempt from Eugenia comes to mind here. ;-)
