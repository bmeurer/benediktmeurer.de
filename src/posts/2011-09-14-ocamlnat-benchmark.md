---
layout: post
title: OCamlNat benchmark
tags: ocaml
---

Now that we have working versions of our new native OCaml toplevel `ocamlnat` without toolchain dependencies for both `i386` and `amd64`, I decided to run a few benchmarks, comparing our [ocamlnat](https://github.com/bmeurer/ocaml-experimental/tree/ocamlnat-jit) to OCaml 3.12.1 (both the byte code toplevel and the ocamlnat that silently ships with 3.12.1) and to our byte-code just-in-time compiler [OCamlJIT2](https://github.com/bmeurer/ocamljit2).

The benchmarks used are test programs from the `testsuite/tests` folder of the OCaml 3.12.1 distribution. They do more or less represent typical OCaml applications. The `almabench`, `fft` and `nucleic` programs are floating point benchmarks, `quicksort` and `sorts` are sorting algorithms, and the remaining are miscellaneous benchmarks. The programs were run on different platforms, measuring the combined user + system time for the process itself and all its child processes (only relevant for the _old_ `ocamlnat` which invokes toolchain programs).

Below is the resulting speedup of the different toplevels compared to the `ocaml` byte code toplevel, with `OCamlNat/ext` being the _old_ `ocamlnat` with the toolchain dependencies that ships with OCaml 3.12.1 and `OCamlNat/jit` being our new implementation available from the [ocamlnat-jit](https://github.com/bmeurer/ocaml-experimental/tree/ocamlnat-jit) branch of my [ocaml-experimental](https://github.com/bmeurer/ocaml-experimental) repository.

<center><a href="/images/2011/ocamlnat-benchmark-20110914.pdf"><img src="/images/2011/ocamlnat-benchmark-20110914-coruscant.png" /></a></center>

<center><a href="/images/2011/ocamlnat-benchmark-20110914.pdf"><img src="/images/2011/ocamlnat-benchmark-20110914-bespin.png" /></a></center>

<center><a href="/images/2011/ocamlnat-benchmark-20110914.pdf"><img src="/images/2011/ocamlnat-benchmark-20110914-imac.png" /></a></center>

<center><a href="/images/2011/ocamlnat-benchmark-20110914.pdf"><img src="/images/2011/ocamlnat-benchmark-20110914-vcs.png" /></a></center>

<center><a href="/images/2011/ocamlnat-benchmark-20110914.pdf"><img src="/images/2011/ocamlnat-benchmark-20110914-echobase.png" /></a></center>

As you can see, the speedup is quite impressive with our native toplevel being up to **100 times faster** than the byte code toplevel. It is however worth noting that this is in part due to the fact that `llvm-gcc` is now the default with OS X, which disables the register assignment optimization in the byte code interpreter.

If you want to try our new toplevel (and/or help with testing), you can always grab the latest source from my [ocaml-experimental](https://github.com/bmeurer/ocaml-experimental) repository using the following command

```
git clone -b ocamlnat-jit git://github.com/bmeurer/ocaml-experimental.git ocamlnat-jit
cd ocamlnat-jit
```

and build and install it using

```
./configure -prefix /path/to/ocamlnat-jit
make world opt ocamlnat
make install
```

similar to the regular OCaml distribution. This will install a fully functional OCaml 3.12.1 system to `/path/to/ocamlnat-jit` together with a new binary `ocamlnat`, our native toplevel. You should be able to use `ocamlnat` as a drop-in replacement for `ocaml` in almost every case, unless you really need the byte code runtime (i.e. [Coq](http://coq.inria.fr) is one popular application that heavily depends on the byte code runtime).
