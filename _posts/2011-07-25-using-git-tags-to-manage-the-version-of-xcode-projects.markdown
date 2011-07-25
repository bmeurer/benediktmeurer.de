---
layout: post
title: Using Git tags to manage the version of Xcode projects
tags: [git, xcode, ios, mac]
---

Inspired by a
[recent post](http://stuff.bondo.net/post/7769890357/using-build-and-version-numbers-and-the-art-of)
of [Joachim Bondo](http://twitter.com/osteslag) I decided to rework my versioning scheme for Xcode
projects as well. One of the major drawbacks of traditional versioning is that the so-called
*marketing version* (Apple slang) is kept twice, once in the project's <code>Info.plist</code>
file and once in the [Git](http://git-scm.com) tag that is created after release. This redundancy
is not only inconvenient, but can also lead to mistakes, i.e. forgetting to bump the
<code>CFBundleShortVersionString</code> prior to tagging the new release.

So instead of maintaing the <code>CFBundleShortVersionString</code> we will now automatically
inject the version number from the most recent Git tag into the generated app bundle. This is
actually pretty easy and requires just the following two lines of shell code in a custom
*Build Phase*:

{% highlight sh %}
# Update the CFBundleShortVersionString in the generated Info.plist using the most recent Git tag.
# Idea taken from http://tinyurl.com/3usjj9d by Joachim Bondo.

# Get the current release description from Git.
GIT_RELEASE_VERSION=`git describe --tags`

# Set the CFBundleShortVersionString in the generated Info.plist (stripping off the leading "v").
defaults write "${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH%.*}" "CFBundleShortVersionString" "${GIT_RELEASE_VERSION#*v}"
{% endhighlight %}

To add it to a target in your Xcode project, select the target, then *Add Build Phase → Add Run Script*,
set the shell to `/bin/bash` and paste the contents of the script above. Make sure it is run
after the *Target Dependencies* phase and before the *Copy Bundle Resources* phase, as shown in
the following screenshot.

<center><a href="/images/2011/xcode-git-version-run-script.png"><img alt="Xcode Set Version script" src="/images/2011/xcode-git-version-run-script.png" /></a></center>

It is important to note that this will alter the `Info.plist` file of the built app bundle,
not the `Info.plist` in your source tree, so your source tree won't get dirty
from this operation, and you won't have to either reset or make another commit which would
create a mismatch between the code you tagged and the code containing the correct version
number. This way the version is stored only in the Git tag (i.e. `v1.0.0`) and you can
remove the `CFBundleShortVersionString` from the `Info.plist` in your source tree.

A nice side effect of using `git describe --tags` is that if you make a development build,
in-between any Git tagging, you will get a version number like `v1.0.0-12-gf181880`. In this
case the version was built from a commit identified by the (partial) SHA `gf181880` which is
12 commits after the last tagged version `v1.0.0`. A great way to handle the *marking version*
of development builds.

