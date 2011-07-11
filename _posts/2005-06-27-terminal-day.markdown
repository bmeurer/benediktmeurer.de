---
layout: post
title: Terminal day
tags: [xfce, terminal]
---

Finally came around to fix some long standing issues for Terminal. While profiling stuff I found out that VTE uses around 24M data memory to manage 13 VteTerminal widgets, which is really a <b>lot</b> of memory.
