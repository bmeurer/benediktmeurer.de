---
layout: githubproject
title: ocamlnat
description: Native toplevel for the OCaml language
github: ocamlnat
copyright: 2010-2011
version: 0.1.1
hide: true
---


## About

The {{ page.github }} project provides a new native code OCaml toplevel `ocamlnat`, which is mostly compatible to the byte code toplevel `ocaml`, but up to **100 times faster**. It is based on the optimizing native code compiler, the native runtime and an earlier prototype by [Alain Frisch](http://alain.frisch.fr). It is build upon Just-In-Time techniques and currently supports Unix-like systems (i.e. Linux, BSD or Mac OS X) running on x86 or x86-64 processors. Support for additional architectures and operating systems is planned, but not yet available.

See below for download links and installation instructions.

### Features

- Up to **100x** faster than the byte code toplevel, as detailed [here](/2011/09/14/ocamlnat-benchmark) and [here](http://arxiv.org/pdf/1110.1029).
- Builtin [Findlib](http://projects.camlcity.org/projects/findlib.html) support, available via
  `#use "topfind";;` similar to the byte code toplevel.


## Download

- 2011/11/11: [ocamlnat-0.1.1.tar.bz2](/files/source/ocamlnat-0.1.1.tar.bz2)
- 2011/11/10: [ocamlnat-0.1.0.tar.bz2](/files/source/ocamlnat-0.1.0.tar.bz2)


## Installation

Download the latest source code release [ocamlnat-{{ page.version }}.tar.bz2](/files/source/ocamlnat-{{ page.version }}.tar.bz2) (or any other release from the list above), and extract the source distribution tarball using the following command:

{% highlight console %}
$ tar xjf ocamlnat-{{ page.version }}.tar.bz2
$ cd ocamlnat-{{ page.version }}
{% endhighlight %}

The installation is similar to the installation of any other [OASIS](http://oasis.forge.ocamlcore.org) based software package, so make sure to consult the [INSTALL](https://raw.github.com/{{ site.github }}/{{ page.github }}/master/INSTALL) and [README](https://raw.github.com/{{ site.github }}/{{ page.github }}/master/README) files if you run into trouble.

Assuming that you want to install ocamlnat into `/usr/local` on a Unix-like system (i.e. Linux, BSD or Mac OS X), proceed as follows:

{% highlight console %}
$ ocaml setup.ml -configure
$ ocaml setup.ml -build
{% endhighlight %}

These are basically the standard configuration and build steps as described in the [INSTALL](https://raw.github.com/{{ site.github }}/{{ page.github }}/master/INSTALL) file. Feel free to pass additional parameters the configuration phase if you need to.

The final step is to install `ocamlnat` into the selected binary directory (i.e. `/usr/local/bin`).

{% highlight console %}
$ sudo ocaml setup.ml -install
{% endhighlight %}

Et voila, now you can use your new native toplevel `ocamlnat`. Assuming that you installed it into `/usr/local`, then you can execute it using the following command, which presents you with an interactive toplevel prompt, i.e.:

{% highlight console %}
$ /usr/local/bin/ocamlnat
        ocamlnat version {{ page.version }} (OCaml version 3.12.1)

# 
{% endhighlight %}

You can use it as a drop-in replacement for the byte code toplevel `ocaml` in almost all cases, and enjoy a performance boost of up to **100x** (compared to the byte code toplevel), as detailed [here](/2011/09/14/ocamlnat-benchmark) and [here](http://arxiv.org/pdf/1110.1029).


## Publications

- Marcell Fischbach and Benedikt Meurer. ["Towards a native toplevel for the OCaml language"](http://arxiv.org/abs/1110.1029). Computing Research Repository (CoRR), Programming Languages (cs.PL), Oct 2011.



## License

{{ page.title }} is licensed under the [Q Public License](http://en.wikipedia.org/wiki/Q_Public_License) similar to the [OCaml](http://caml.inria.fr/ocaml) distribution. See the [LICENSE](https://github.com/{{ site.github }}/{{ page.github }}/raw/master/LICENSE) file for details and exceptions.
