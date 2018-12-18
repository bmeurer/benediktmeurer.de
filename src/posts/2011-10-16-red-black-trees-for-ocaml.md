---
layout: post
title: Red-Black Trees for OCaml
tags: ocaml
---

I decided that it was about time to get used to [OASIS](http://oasis.forge.ocamlcore.org/), that _new_ all-in-one build system generator for OCaml projects. So I started by getting it up and running using various [local MacPorts](https://github.com/bmeurer/MacPorts/). Once everything was up and running, I started to switch my implementation of [Red-Black Trees for OCaml](https://github.com/bmeurer/ocaml-rbtrees/) to use OASIS instead of my custom `Makefile`-based approach. That went amazingly well, and so here's my first release, version 0.1.0, of `ocaml-rbtrees` featuring an OASIS-generated build system.

Download: [https://github.com/downloads/bmeurer/ocaml-rbtrees/ocaml-rbtrees-0.1.0.tar.gz](https://github.com/downloads/bmeurer/ocaml-rbtrees/ocaml-rbtrees-0.1.0.tar.gz)

Git repository: [https://github.com/bmeurer/ocaml-rbtrees](https://github.com/bmeurer/ocaml-rbtrees)

For those of you using [MacPorts](http://www.macports.org/) on Mac OS X, ocaml-rbtrees 0.1.0 is also available from my local [MacPorts Portfile repository](https://github.com/bmeurer/MacPorts/) as `caml-rbtrees`.
