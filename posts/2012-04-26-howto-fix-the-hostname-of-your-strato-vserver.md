---
layout: post
title: How to fix the hostname of your Strato V-Server
---

The [Strato](http://www.strato.de) Linux V-Servers always reset their hostnames to `hXXXXXX.stratoserver.net` on boot, no matter what you put in `/etc/hostname` and there's no way to fix this (it's actually intended behavior). If you happen to have a Strato V-Server running Debian, here's a simple failsafe way to fix the hostname early during boot and have all daemons use your desired hostname.

Assuming that your desired fully qualified hostname is `www.example.org`, then create a new file `/etc/init.d/strato-hostname-fix.sh` with the following content

```bash
#! /bin/sh
### BEGIN INIT INFO
# Provides:          strato-hostname-fix
# Required-Start:
# Required-Stop:
# Default-Start:     S
# Default-Stop:
# X-Start-Before:    hostname
# Short-Description: Fix the Strato overwritten hostname.
# Description:       Fix the hostname in /etc/hostname and /etc/hosts that
#                    was previously overwritten by the Strato V-Server.
### END INIT INFO

PATH=/sbin:/bin

. /lib/init/vars.sh
. /lib/lsb/init-functions

do_start () {
        sed -i \
                -e 's/h[0-9][0-9]*/www/g' \
                -e 's/stratoserver\.net/example.org/g' \
                /etc/hostname \
                /etc/hosts
        exit $?
}

case "$1" in
  start|"")
        do_start
        ;;
  status|restart|reload|force-reload)
        echo "Error: argument '$1' not supported" >&2
        exit 3
        ;;
  stop)
        # No-op
        ;;
  *)
        echo "Usage: strato-hostname-fix.sh [start|stop]" >&2
        exit 3
        ;;
esac

:
```

and setup the script using the following command:

```
$ sudo insserv /etc/init.d/strato-hostname-fix.sh
```

Afterwards just reboot the machine. The above was successfully tested with Debian 6.0.4 (squeeze), and should also work with recent Ubuntu versions.
