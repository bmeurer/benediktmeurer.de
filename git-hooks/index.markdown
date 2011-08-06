---
layout: githubproject
title: git-hooks
description: Generic Git hooks
github: git-hooks
copyright: 2009-2011
---


## About

git-hooks provides a simple mechanism to manage hooks for several [Git](http://git-scm.com) repositories in a unified and simple way. It allows you to install hook scripts in a central location and use them for your Git repositories.


## Installation

You need [CMake](http://www.cmake.org) and [GCC](http://gcc.gnu.org) in order to build and install git-hooks. You will also need to have [Git](http://git-scm.com) and [Perl](http://www.perl.org) installed for the hooks to work properly.  To build git-hooks run

{% highlight console %}
$ cmake /path/to/git-hooks
$ make
{% endhighlight %}

in a new directory (preferably, tho you may also run it from the source directory). Then, use

{% highlight console %}
$ make install
{% endhighlight %}

to install git-hooks. This will install git-hooks to <code>/usr/local</code>. You can use ccmake to change the installation prefix. Below, we will assume that you installed git-hooks to <code>/usr/local</code>.


## Repository setup

To setup a repository using git-hooks, just use the repository template that ships with git-hooks.

{% highlight console %}
$ mkdir myrepo.git
$ cd myrepo.git
$ git --bare init --template=/usr/local/share/git-hooks/template ...
{% endhighlight %}

This will setup the new repository <code>myrepo.git</code> with git-hooks. Check the sample config file that will be created for <code>myrepo.git</code>.


## Repository migration

To migrate an existing repository to use git-hooks, you should first backup your existing hook scripts. Then replace the hooks with the ones from <code>/usr/local/share/git-hooks/template/hooks</code>. Afterwards, you should migrate your previous hook scripts to global hook scripts used by git-hooks.


## Configuration

The git-hooks package includes several useful hooks, which can be configured to your needs using git config settings in your repository (or even global settings from <code>/etc/gitconfig</code>). The <code>/usr/local/share/git-hooks/template/config</code> file provides a sample configuration file.

Please see the hook scripts in <code>/usr/local/share/git-hooks/*.d/</code> for the various supported config settings.

## License

git-hooks is licensed under the [GNU GENERAL PUBLIC LICENSE Version 2](http://www.gnu.org/licenses/gpl-2.0.html). See the [LICENSE](http://github.com/bmeurer/{{ page.github }}/raw/master/LICENSE) file for details.

