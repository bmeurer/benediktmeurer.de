---
layout: githubproject
title: ocaml-experimental
description: Experimental changes to OCaml
github: ocaml-experimental
copyright: 2010-2011
version: 3.12.1+ocamlnatjit2
date: 2011-10-06
hide: true
---


## About

The [{{ page.github }} repository](https://github.com/{{ site.github }}/{{ page.github }}) serves as a playground for experimenting with new features and changes to the [OCaml](http://caml.inria.fr/ocaml) language and runtime, including a new [native code toplevel](http://arxiv.org/abs/1110.1029) `ocamlnat` and an implementation of the [linear scan register allocator](http://portal.acm.org/citation.cfm?id=330250) for the optimizing native code compiler `ocamlopt`.


### Native code toplevel

We have developed a new [native code OCaml toplevel](/ocamlnat) `ocamlnat`, which is up to **100 times faster** than the byte code toplevel `ocaml`. It is based on the optimizing native code compiler, the native runtime and an earlier prototype by [Alain Frisch](http://alain.frisch.fr). It is build upon Just-In-Time techniques and currently supports Unix-like systems (i.e. Linux, BSD or Mac OS X) running on x86 or x86-64 processors. Support for additional architectures and operating systems is planned, but not yet available.

The native code toplevel was moved to a new project [ocamlnat](/ocamlnat).


## Download

- 2011/10/06: [ocaml-3.12.1+ocamlnatjit2.tar.bz2](/files/source/ocaml-3.12.1+ocamlnatjit2.tar.bz2)
- 2011/09/18: [ocaml-3.12.1+ocamlnatjit1.tar.bz2](/files/source/ocaml-3.12.1+ocamlnatjit1.tar.bz2)


## Installation

Download the latest source code release [ocaml-{{ page.version }}.tar.bz2](/files/source/ocaml-{{ page.version }}.tar.bz2) (or any other release from the list above), and extract the source distribution tarball using the following command:

{% highlight console %}
$ tar xjf ocaml-{{ page.version }}.tar.bz2
$ cd ocaml-{{ page.version }}
{% endhighlight %}

The installation is similar to the installation of any regular upstream OCaml source distribution, so make sure to consult the [INSTALL](https://raw.github.com/bmeurer/ocaml-experimental/master/INSTALL) and [README](https://raw.github.com/bmeurer/ocaml-experimental/master/README) files if you run into trouble.

Assuming that you want to install the experimental OCaml into `/usr/local` on a Unix-like system (i.e. Linux, BSD or Mac OS X), proceed by

{% highlight console %}
$ ./configure -prefix /usr/local
$ make world
$ make opt
$ make opt.opt
{% endhighlight %}

These are basically the standard configuration and build steps as described in the [INSTALL](https://raw.github.com/bmeurer/ocaml-experimental/master/INSTALL) file. Feel free to pass additional parameters the `configure` script if you need to.

Afterwards run the following command to also build the new native OCaml toplevel `ocamlnat`, which is currently only available on Unix-like systems running on x86 or x86-64 processors, so this command will fail on other systems.

{% highlight console %}
$ make ocamlnat
{% endhighlight %}

The final step is to install the new OCaml distribution into the selected prefix directory (i.e. `/usr/local`).

{% highlight console %}
$ sudo make install
{% endhighlight %}

Et voila, now you can use your new OCaml distribution, especially the new `ocamlnat` toplevel. Assuming that you installed it into `/usr/local`, then you can execute it using the following command, which presents you with an interactive toplevel prompt, i.e.:

{% highlight console %}
$ /usr/local/bin/ocamlnat
        Objective Caml version {{ page.version }} ({{ page.date }}) - native toplevel

# 
{% endhighlight %}

You can use it as a drop-in replacement for the byte code toplevel `ocaml` in almost all cases, and enjoy a performance boost of up to **100x** (compared to the byte code toplevel), as detailed [here](/2011/09/14/ocamlnat-benchmark) and [here](http://arxiv.org/pdf/1110.1029).


## Publications

- Marcell Fischbach and Benedikt Meurer. ["Towards a native toplevel for the OCaml language"](http://arxiv.org/abs/1110.1029). Computing Research Repository (CoRR), Programming Languages (cs.PL), Oct 2011.



## License

{{ page.title }} is licensed under the [Q Public License](http://en.wikipedia.org/wiki/Q_Public_License) and the [GNU Lesser General Public License](http://en.wikipedia.org/wiki/GNU_Lesser_General_Public_License) just like the original [OCaml](http://caml.inria.fr/ocaml) distribution. See the [LICENSE](https://github.com/{{ site.github }}/{{ page.github }}/raw/master/LICENSE) file for details and exceptions.
