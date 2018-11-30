---
layout: post
title: Introduction to NetBSD loadable kernel modules
---


Introduction
------------

Loadable kernel modules (LKMs) are quite popular on most modern operating systems such as
[GNU/Linux](http://www.kernel.org), [FreeBSD](http://www.freebsd.org) and of course
Microsoft Windows, just to name a few. They offer you the possibility to extend the kernel's
functionality at runtime without recompiling or even rebooting the system. For example nearly
every Linux device driver is available - or can be made available - as a loadable kernel module,
that can be loaded at runtime to get support for a particular device (or even a pseudo-device).

With [NetBSD](http://www.netbsd.org), LKMs are not that popular yet. At the time of this writing
only a few drivers are available as loadable modules (mostly filesystem and compat drivers, and
a few others such as the <code>linuxrtc</code> emulation). This might change in near future.

The loadable kernel module interface was originally designed to be similar in functionality to the
loadable kernel modules facility provided by SunOS. The [lkm(4)](http://netbsd.gw.com/cgi-bin/man-cgi?lkm+4+NetBSD-1.6)
facility is controlled by performing [ioctl(2)](http://netbsd.gw.com/cgi-bin/man-cgi?ioctl+2+NetBSD-1.6)
calls on the <code>/dev/lkm</code> device, but since all operations are handled by the
[modload(8)](http://netbsd.gw.com/cgi-bin/man-cgi?modload+8+NetBSD-1.6),
[modunload(8)](http://netbsd.gw.com/cgi-bin/man-cgi?modunload+8+NetBSD-1.6) and
[modstat(8)](http://netbsd.gw.com/cgi-bin/man-cgi?modstat+8+NetBSD-1.6) programs, you should never
have to interact with <code>/dev/lkm</code> directly. Note, that you need to run a kernel compiled
with the [LKM](http://netbsd.gw.com/cgi-bin/man-cgi?lkm+4+NetBSD-1.6) option in order to make use of LKMs.


Writing the module
------------------

I'd like to show you how to write a simple character device driver that does nothing but the simple job of
calculating the [Fibonacci numbers](http://en.wikipedia.org/wiki/Fibonacci_number) (I'll therefore name
the module <code>fibo.o</code> and let all the function's names begin with <code>fibo_</code>). The driver
will provide 8 minor devices <code>/dev/fibo0</code> to <code>/dev/fibo7</code>.
Each minor device offers the following functions:

{% highlight cpp %}
static int fibo_open(dev_t, int, int, struct proc *);
static int fibo_close(dev_t, int, int, struct proc *);
static int fibo_read(dev_t dev, struct uio *, int);
{% endhighlight  %}

You can open and close a device provided by this driver and you'll be able to read from it (we'll have
a closer look at the parameters later, when we discuss the actual functions). Now we need to tell the
kernel that we provide a character device with the 3 functions listed above. Therefore we need to fill
in a <code>struct cdevsw</code> (_cdevsw_ means _character device switch_ and the <code>struct cdevsw</code>
is defined in <code>sys/conf.h</code>).

{% highlight cpp %}
static struct cdevsw fibo_dev = {
  fibo_open,
  fibo_close,
  fibo_read,
  (dev_type_write((*))) enodev,
  (dev_type_ioctl((*))) enodev,
  (dev_type_stop((*))) enodev,
  0,
  (dev_type_poll((*))) enodev,
  (dev_type_mmap((*))) enodev,
  0
};
{% endhighlight %}

<code>enodev</code> is a generic function that simply returns the
[errno(2)](http://netbsd.gw.com/cgi-bin/man-cgi?errno+2+NetBSD-1.6) <code>ENODEV</code>
(_Operation not supported by device_) which says that we does not support any operations besides
open, close and read. So, for example, whenever you try to write to the device, the
[write(2)](http://netbsd.gw.com/cgi-bin/man-cgi?write+2+NetBSD-1.6) will fail with <code>ENODEV</code>.

Furtheron we need to tell the kernel how the module is named and where to find information about
operations provided by the module. This is a quite simple task with the lkm interface: We use the
preprocessor macro <code>MOD_DEV</code>, which is defined in <code>sys/lkm.h</code> to hand the
information over. The <code>MOD_DEV</code> macro was changed in NetBSD-current, therefore we use
the following construct to get things working with both NetBSD 1.6 and earlier and NetBSD 1.6H and
later (thanks to [Anil Gopinath](mailto:anil_public@yahoo.com) for the hint).

{% highlight cpp %}
#if (__NetBSD_Version__ >= 106080000)
MOD_DEV("fibo", "fibo", NULL, -1, &fibo_dev, -1);
#else
MOD_DEV("fibo", LM_DT_CHAR, -1, &fibo_dev);
#endif
{% endhighlight %}

This means that our module is named <code>fibo</code>, we'll provide a character device (minor devices
are handled by the module itself, so they doesn't matter for now), we want to retrieve a dynamic major
device number from the kernel (if you want to use a specific major device number you'll need to specify
that instead of the <code>-1</code>, but beware of getting in conflict with other device drivers) and we
provide the information about the supported operations in <code>fibo_dev</code>.

In order to ensure proper unloading of the module we need to keep a global reference counter of opened
minor devices.

{% highlight cpp %}
static int fibo_refcnt = 0;
{% endhighlight %}

And furtheron we need to keep a bunch of information about each minor device.

{% highlight cpp %}
struct fibo_softc {
  int       sc_refcnt;
  u_int32_t sc_current;
  u_int32_t sc_previous;
};
 
#define MAXFIBODEVS 8
 
static struct fibo_softc fibo_scs[MAXFIBODEVS];
{% endhighlight %}

As mentioned above our driver will provide 8 minor devices. Each minor device stores information about
how often it was opened (in our example each minor device can only be opened once to keep things simple),
the current number and the previous number for calculating the Fibonacci numbers. If you don't know how
to calculate the Fibonacci numbers, you should have a look on a book about algorithms, as explaining this
is beyond the scope of this article.

Each kernel module needs to have an entry point which is passed to
[ld(1)](http://netbsd.gw.com/cgi-bin/man-cgi?ld+1+NetBSD-1.6) by modload when the module is linked. The
default module entry point is named <code>xxxinit</code>. If <code>xxxinit</code> cannot be found, an
attempt to use <code><i>modulename</i>_lkmentry</code> will be made, where <code><i>modulename</i></code>
is the filename of the module being loaded without the <code>.o</code>. In general the entry function will
consist entirely of a single <code>DISPATCH</code> line, with <code>DISPATCH</code> being a preprocessor
macro defined in <code>sys/lkm.h</code> to handle loading, unloading and stating for us. So our
<code>fibo_lkmentry</code> function will look like this:

{% highlight cpp %}
int
fibo_lkmentry(struct lkm_table *lkmtp, int cmd, nt ver)
{
  DISPATCH(lkmtp, cmd, ver, fibo_handle, fibo_handle, fibo_handle);
}
{% endhighlight %}

Now we need a handler function for our module to do module specific tasks when loading, unloading or stating
the module. The name of this handler function is passed to <code>DISPATCH</code> (see above) to tell the
kernel which function it has to call when doing such things. A pointer to the module entry in the LKM table
and an integer representing the desired command (<code>LKM_E_LOAD</code>, <code>LKM_E_UNLOAD</code> or
<code>LKM_E_STAT</code>) are passed to the handler function. The handler is called after the module is
linked and loaded into the kernel with the <code>LKM_E_LOAD</code> command. Then we need to check whether
the module was already loaded into the kernel and initialize our data structures. When unloading the module,
the handler is called with the <code>LKM_E_UNLOAD</code> command and we need to check if the module is not
required any more (e.g. check if all devices are closed for char/block driver modules) before confirming the
unload command.

{% highlight cpp %}
static int
fibo_handle(struct lkm_table *lkmtp, int cmd)
{
  switch (cmd) {
  case LKM_E_LOAD:
    /* check if module was already loaded */
    if (lkmexists(lkmtp))
      return (EEXIST);
      
    /* initialize minor device structures */
    bzero(fibo_scs, sizeof(fibo_scs));
    printf("fibo: FIBONACCI driver loaded successfully\n");
    break;
    
  case LKM_E_UNLOAD:
    /* check if a minor device is opened */
    if (fibo_refcnt > 0)
      return (EBUSY);
    break;
    
  case LKM_E_STAT:
    break;
    
  default:
    return (EIO);
  }
  
  return (0);
}
{% endhighlight %}
 
The open function is quite simple as most of the hard stuff is already handled by the NetBSD kernel
(e.g. the kernel will automatically allocate a [vnode(9)](http://netbsd.gw.com/cgi-bin/man-cgi?vnode+9+NetBSD-1.6)
for you). The parameters for the open function are the major and minor device numbers (use the <code>major</code>
and <code>minor</code> macros), the <code>flag</code> and <code>mode</code> arguments as described in
[open(2)](http://netbsd.gw.com/cgi-bin/man-cgi?open+2+NetBSD-1.6) and a pointer to the <code>struct proc</code>
of the process that did the open system call.

So the first thing to do is to check if the minor device number we got when the device was opened is not out of
range, and if the minor device is not already opened. You should always keep in mind that the minor device
handling is completely up to you and that this is a never ending source of mistakes! Then we need to initialize
the minor device data (the Fibonacci starting numbers 1, 0 + 1 = 1, 1 + 1 = 2, 1 + 2 = 3, ...) and increase the
minor device and the global module reference counter.

{% highlight cpp %}
static int
fibo_open(dev_t dev, int flag, int mode, struct proc *p)
{
  struct fibo_softc *fibosc = (fibo_scs + minor(dev));
  
  if (minor(dev) >= MAXFIBODEVS)
    return (ENODEV);
    
  /* check if device already open */
  if (fibosc->sc_refcnt > 0)
    return (EBUSY);
    
  fibosc->sc_current = 1;
  fibosc->sc_previous = 0;
 
  /* increase device reference counter */
  fibosc->sc_refcnt++;
  
  /* increase module reference counter */
  fibo_refcnt++;
  
  return (0);
}
{% endhighlight %}
 
The close function has the same parameters with the same meanings as the open function described above. It
is used to free the internal data structures of a minor device opened before. You do not need to worry whether
the device was opened before or to do things like releasing the vnode associated with the device, all you need
to do is to cleanup the module specific stuff. In our example this means decreasing the minor device and the
global module reference counters and so that our close function is quite simple.

{% highlight cpp %}
static int
fibo_close(dev_t dev, int flag, int mode, struct proc *p)
{
  struct fibo_softc *fibosc = (fibo_scs + minor(dev));
  
  /* decrease device reference counter */
  fibosc->sc_refcnt--;
  
  /* decrease module reference counter */
  fibo_refcnt--;
  
  return (0);
}
{% endhighlight %}
 
Last but not least the read function. This function has 3 parameters: the device major and minor numbers like
in the open and close functions, a <code>flag</code> field indicating for example whether the read should be
done in a non-blocking fashion or such things and a pointer to a <code>struct uio</code> defined in
<code>sys/uio.h</code>. A <code>struct uio</code> typically describes data in motion, in case of a
[read(2)](http://netbsd.gw.com/cgi-bin/man-cgi?read+2+NetBSD-1.6) system call data moved from kernel-space
to user-space. This may look a bit strange if you already did device driver progamming on GNU/Linux, but the
uio concept used by the NetBSD kernel simplifies a lot of things and provides a generic and consistent interface
for kernel-space to user-space and kernel-space to kernel-space data moving. See
[uiomove(9)](http://netbsd.gw.com/cgi-bin/man-cgi?uiomove+9+NetBSD-1.6) for more information.

Back on stage, we should first have a look at the read function and discuss the details afterwards.

{% highlight cpp %}
static int
fibo_read(dev_t dev, struct uio *uio, int flag)
{
  struct fibo_softc *fibosc = (fibo_scs + minor(dev));
  
  if (uio->uio_resid < sizeof(u_int32_t))
    return (EINVAL);
    
  while (uio->uio_resid >= sizeof(u_int32_t)) {
    int error;
    
    /* copy to user space */
    if ((error = uiomove(&(fibosc->sc_current),
    		    sizeof(fibosc->sc_current), uio))) {
      return (error);
    }
    
    /* prevent overflow */
    if (fibosc->sc_current > (MAXFIBONUM - 1)) {
      fibosc->sc_current = 1;
      fibosc->sc_previous = 0;
      continue;
    }
    
    /* calculate */ {
      u_int32_t tmp;
      
      tmp = fibosc->sc_current;
      fibosc->sc_current += fibosc->sc_previous;
      fibosc->sc_previous = tmp;
    }
  }
  
  return (0);
}
{% endhighlight %}
 
So the first thing we do, is to check whether the process requests less than <code>sizeof(u_int32_t)</code>
bytes (actually 4 bytes). Our read function always reads a bunch of 4-byte blocks and to keep it simple
and easy to understand we disallow reading less than 4 bytes at a time (<code>uio->uio_resid</code> holds
the number of remaining bytes to move to user-space, automatically decreased by <code>uiomove</code>).

The function copies the current Fibonacci number into the user-space buffer, checks for a possible overflow
(only the first 42 Fibonacci numbers fit into <code>u_int32_t</code>) and calculates the next Fibonacci
number. If there is enough space left in the user-space buffer, the function loops and restarts the process
of moving, checking and calculating until the buffer is filled up to the possible maximum or
[uiomove(9)](http://netbsd.gw.com/cgi-bin/man-cgi?uiomove+9+NetBSD-1.6) returns an error. Note, that a
[read(2)](http://netbsd.gw.com/cgi-bin/man-cgi?read+2+NetBSD-1.6) system call on this device will never
return 0, and so it will never reach an end-of-file (EOF), so the device will generate Fibonacci numbers
forever.

If you're familar with GNU/Linux device driver programming you might have noticed that we do not return
<code>-<i>ERRNO</i></code> on failure, and in case of the read system call the number of bytes read, but
instead we return <code>0</code> on success and the positive errno value on failure. Everything else is
handled by the NetBSD kernel itself, so we do not need to care about.


Loading the module
------------------

Now that our device driver module is completed, we need a shell script that will be executed when the module
is successfully loaded to create the required device nodes in <code>/dev</code>. This shell script (or program)
is always passed three arguments: the module id (in decimal), the module type (in hexadecimal) and the character
major device number (this differs for other types of LKMs such as system call modules). So our script is pretty
simple:

{% highlight sh %}
if [ $# -ne 3 ]; then
  echo "$0 should only be called from modload(8) with 3 args"
  exit 1
fi
{% endhighlight %}
          
First check whether all three command line arguments are present and exit with error code if not.

{% highlight sh %}
for i in 0 1 2 3 4 5 6 7; do
  rm -f /dev/fibo$i
  mknod /dev/fibo$i c $3 $i
  chmod 666 /dev/fibo$i
done
exit 0
{% endhighlight %}
          
And finally (re)create the required special device nodes. Now we are ready to give our module a first test run.
Compile the module and load the module with the following command (this needs to be run as superuser):

{% highlight sh %}
modload -e fibo_lkmentry -p fibo_post.sh fibo.o
{% endhighlight %}
 
If everything went well, the [modstat(8)](http://netbsd.gw.com/cgi-bin/man-cgi?modstat+8+NetBSD-1.6) program
should present you output similar to this:
          
{% highlight text %}
Type    Id  Off Loadaddr Size Info     Rev Module Name
DEV      0   29 dca4f000 0004 dca4f260   1 fibo
{% endhighlight %}

            
Testing the module
------------------

In order to test your new kernel module, we need a small test program that does nothing more than reading a
32bit unsigned integer value from <code>/dev/fibo0</code> and outputs the value to standard output. See the
sample program below:

{% highlight cpp %}
#define DEVICE "/dev/fibo0"
 
int
main(int argc, char **argv)
{
  u_int32_t val;
  int fd, ret;
  
  if ((fd = open(DEVICE, O_RDONLY)) < 0)
    err(1, "unable to open " DEVICE);
    
  while ((ret = read(fd, &val, sizeof(val))) == sizeof(val))
    printf("%u\n", val);
    
  if (ret < 0)
    err(2, "read(" DEVICE ")");
    
  close(fd);
  return 0;
}
{% endhighlight %}
 
When you run this sample test program, it will output Fibonacci numbers below 2971215074 until you interrupt
or kill the program. To unload the kernel module, you need to run the following command (as superuser):

{% highlight sh %}
modunload -n fibo
{% endhighlight %}

The complete sources for the example above, including a <code>Makefile</code>, are available online at:

- <a href="https://github.com/bmeurer/fibo_drv">https://github.com/bmeurer/fibo_drv</a>

A <code>tar</code> archive with the sources can be found
<a href="https://github.com/bmeurer/fibo_drv/tarball/master">here</a>.
I hope you like this small introduction to the NetBSD lkm system. If you have any questions or if you
would like to give me some feedback, feel free to contact <a href="/about">me</a>.


