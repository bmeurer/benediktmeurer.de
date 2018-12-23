---
title: Towards a native toplevel for the OCaml language
tags:
  - ocaml
  - research
---

This paper presents the current state of our work on an interactive toplevel for the OCaml language based on the optimizing native code compiler and runtime. Our native toplevel is up to 100 times faster than the default OCaml toplevel, which is based on the byte code compiler and interpreter. It uses Just-In-Time techniques to compile toplevel phrases to native code at runtime, and currently works with various Unix-like systems running on x86 or x86-64 processors.

[http://arxiv.org/abs/1110.1029](http://arxiv.org/abs/1110.1029)
