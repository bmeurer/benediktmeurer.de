---
layout: post
title: Linux for losers
tags: [linux, openbsd]
---

A friend of mine pointed me to an interesting <a href="http://www.forbes.com/intelligentinfrastructure/2005/06/16/linux-bsd-unix-cz_dl_0616theo.html">article</a> today, which on first sight looked like just another useless Linux vs. BSD article, esp. since it quotes Theo De Raadt, who was never known for being very objective.  But De Raadt points out some real problems with the Linux development model (everybody that has ever worked on the kernel or a non-trivial driver will be aware of these problems). Unfortunately, De Raadt's diction is very bad, as usual, and so it's unlikely that any of the Linux guys will pay much attention.

But the problems with quality assurance is not limited to Linux in the open source world. Many OSS hackers still seem to believe, that <i>"if it runs, it's good"</i>, which is obviously not the case.  There's a common misbelieve that the <b>crux</b> in being part of the OSS world is knowledge about <i>coding</i> (it'd rather use the term <i>hacking</i>). From my experience, <i>coding</i> was always (and is still) the easiest part of the story. The <b>hard work</b> is to figure out what to <i>code</i>, and how to organize the various modules, to make it fit into the whole picture, and once the implementation is done, verify that the implementation covers all use cases and performs well. This is the shortest possible definition of my understanding of how to develop high-quality software.

But in order to develop the way described above, you need to setup clear goals for your projects. And this is exactly the point where Linux and many other OSS projects lose. They concentrate too much on providing an <i>universal</i> solution or on adding a new feature as soon as possible, and so improvements happens by fluke many times, not as a result of structured development and quality assurance. And even if they're pushed by big players like IBM at the moment, this kind of development won't work in the long run.

I'm not trying to blame Linux/OSS hackers, instead I strongly invite people to think about their development models and their understanding of open source. Take the chance to develop high quality software in your spare time; many of us will be forced to develop low quality software in our daily job anyways (yannow that money thing), so don't you think you could do better in your spare time? Of course it takes time and the feeling of success won't show up that early, but in the end you can be proud of your work.

Of course I could also be completely wrong here, and my understanding of open source is simply escapist.

