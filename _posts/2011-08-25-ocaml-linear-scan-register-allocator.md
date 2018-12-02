---
layout: post
title: Linear Scan Register Allocator for the OCaml Native Code Compiler
---

I recently imported the first working version of the [Linear Scan Register Allocator](http://www.cs.ucla.edu/~palsberg/course/cs132/linearscan.pdf) for the [OCaml](http://caml.inria.fr/ocaml) Native Code Compiler `ocamlopt` into the [linear-scan-register-allocator](https://github.com/bmeurer/ocaml-experimental/tree/linear-scan-register-allocator) branch of my [ocaml-experimental](https://github.com/bmeurer/ocaml-experimental) repository. The register allocator was implemented for `ocamlopt` by Marcell Fischbach as part of his diploma thesis. It presents a first step towards a (better) native OCaml toplevel `ocamlnat`. Use the following command to checkout the source code:

```
$ git clone -b linear-scan-register-allocator git://github.com/bmeurer/ocaml-experimental.git ocaml-linscan
```

The implementation of the linear scan register allocator can be found in `asmcomp/interval.ml`, `asmcomp/interval.mli`, `asmcomp/linscan.ml` and `asmcomp/linscan.mli` (integrated into `ocamlopt` via [asmcomp/asmgen.ml](https://github.com/bmeurer/ocaml-experimental/commit/741802a5cde4e4ea3ee58dfa91c8832b5bb86544#asmcomp/asmgen.ml)).

Some initial timing results are available [here](http://ps.informatik.uni-siegen.de/~meurer/tmp/compiletime_timings.pdf), [here](http://ps.informatik.uni-siegen.de/~meurer/tmp/linscan-i7-i386-timings.pdf), and [here](http://ps.informatik.uni-siegen.de/~meurer/tmp/runtime_timings.pdf). See [bug 5324](http://caml.inria.fr/mantis/view.php?id=5324) for additional details.
