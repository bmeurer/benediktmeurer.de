---
layout: post
title: SSH via SSH Tunnel
tags: [ssh, tunnel, linux, osx]
---

Imagine you want to connect via SSH to remote systems `hostB` and `hostC` on an intranet behind `hostA`. This could be achieved easily using port forwarding via `hostA`, just pick two arbitrary ports on the local machine and forward them to ports 22 of `hostB` and `hostC`. This works very well for a small amount of intranet hosts, but it get's quite messy as the list of hosts grows. After some time you'll have a rather huge amount of local ports to remember (or to lookup in your port forwarding script several times a day). It'd certainly be easier to just type `ssh hostB` and have the tunnel setup automatically.

Fortunately that is very well possible and quite easy to achieve using the `ProxyCommand` directive. Assuming `hostA` has `nc` installed, you can just add the following lines to your `$HOME/.ssh/config`.

{% highlight text %}
Host hostB
    HostKeyAlias hostB
    ProxyCommand ssh hostA 'nc hostB 22'

Host hostC
    HostKeyAlias hostC
    ProxyCommand ssh hostA 'nc hostC 22'
{% endhighlight %}

Once done, you can easily connect to `hostB` via `ssh hostB`, or `hostC` via `ssh hostC`. No need to setup the tunnel first, it'll be set up and teared down automagically as needed.

