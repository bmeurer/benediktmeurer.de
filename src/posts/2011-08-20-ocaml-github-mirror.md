---
title: OCaml GitHub Mirror
tags: ocaml
---

During the last two days I managed to setup a [GitHub](http://github.com) [mirror](https://github.com/bmeurer/ocaml) of [OCaml](http://caml.inria.fr/ocaml/). It works by importing the changes from the official [OCaml Subversion Repository](http://caml.inria.fr/cgi-bin/viewcvs.cgi/ocaml/) using `git-svn` and pushing them to the [GitHub mirror](https://github.com/bmeurer/ocaml). This is done automatically every hour by one of my servers. It works by setting up a Git branch for every `version` Subversion branch and a Git branch with a `tags/` prefix for every `tags` Subversion branch. Also note that the master branch is called `trunk`.

I wanted to do this for some time now, but as some of you know, time is always against us. The major advantage is that there is now a single Git base for all my OCaml projects (and that of others), and there's is no longer a need to fiddle with `git-svn` in each and every project. Feel free to [fork](https://github.com/bmeurer/ocaml/fork) my [ocaml](https://github.com/bmeurer/ocaml) repository for your own needs.
