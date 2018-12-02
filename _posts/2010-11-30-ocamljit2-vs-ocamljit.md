---
layout: post
title: OCamlJIT2 vs. OCamlJIT
tags: ocaml
---

I did some final work on [OCamlJIT2](/2010/11/16/ocamljit-20), and compared the result to OCamlJIT. The performance measures are presented in the following tech report (skip straight to section 4 for the performance results):

[http://arxiv.org/abs/1011.6223](http://arxiv.org/abs/1011.6223)

In short: Performance measured on a P4 "Northwood" (no long mode, plain x86) 2.4GHz. OCamlJIT2 beats OCamlJIT by a factor of 1.1 to 2.0 in every benchmark, and - rather surprising - was even able to beat `ocamlopt` in the number crunching benchmark (probably an issue with the x86 backend of `ocamlopt`).

As mentioned by Xavier Leroy and others previously, we probably went as far as we could go in the direction of JITting the byte-code virtual machine, while preserving its general stack-based nature and instruction set. Moving even further means translating the byte-code to some intermediate form suitable for use with standard compilation techniques; but as we saw earlier, in an LLVM-based prototype, the compilation overhead increases dramatically and the benefit of JIT compilation vanishes.

Therefore, as suggested earlier, I'll try to get my hands on the native top-level now (already contacted Alain for the emitter code). Additionally, the linear scan register allocation will be implemented by a student as part of his diploma thesis.

### Update

See the [discussion](http://caml.inria.fr/pub/ml-archives/caml-list/2010/11/7363093c6ecec4e7fea18ccdfcf3366b.en.html) on the [Caml mailing list](http://caml.inria.fr/pub/ml-archives/caml-list/index.en.html).
