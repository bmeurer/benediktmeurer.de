---
layout: post
title: Introducing jekyll-workbox-plugin
tags:
  - jekyll
  - workbox
---

I spent some time today and hacked together a simple [Jekyll](https://jekyllrb.com) plugin to automatically
generate a service worker with [Google Workbox](https://developers.google.com/web/tools/workbox), with minimal
overhead / effort. I had previously used the [jekyll-pwa-plugin](https://github.com/lavas-project/jekyll-pwa),
which is awesome, but it's doing a bit too much for my taste:

1. Local copy of the workbox distribution rather than fetching it from the Google CDN.
2. Generates both the actual service `sw.js` as well as a loader script `sw-register.js`, which also emits a
   `sw.update` event, which I don't need.
3. Inserts a `<script>` snippet into each `.html` file generated that loads `sw-register.js`, prepending the
   current timestamp to the URL to avoid caching.

The `sw-register.js` itself also uses a timestamped URL to load the `sw.js` file. All of this is actually unnecessary
since I have configured my server to respond with `Cache-Control: no` to `sw.js` requests (and even that is no
longer necessary as [I learned today](https://developers.google.com/web/updates/2018/06/fresher-sw)), plus I
already have a `main.js` that runs during page load, so I'd rather do the service worker registration there via
the common sequence:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

The only thing I actually need is the ability to do the precaching automatically and inject the right call to
`workbox.precaching.precacheAndRoute()` into the final `sw.js`, plus the convenience of adding the appropriate
`importScript()` call in the beginning.

So I created the [jekyll-workbox-plugin](https://github.com/bmeurer/jekyll-workbox-plugin) ([ruby
gem](https://rubygems.org/gems/jekyll-workbox-plugin)), which does that - and only that. I hope you'll find it
useful. You can find documentation regarding [Installation](https://github.com/bmeurer/jekyll-workbox-plugin#installation)
and [Getting Started](https://github.com/bmeurer/jekyll-workbox-plugin#getting-started) on the project page. In
a nutshell, you add `gem 'jekyll-workbox-plugin'` to the `jekyll_plugin` group in your `Gemfile`

```ruby
source 'https://rubygems.org'

gem 'jekyll'

group :jekyll_plugins do
  gem 'jekyll-workbox-plugin'
end
```

and run `bundle` to install the gem. After the plugin has been installed successfully, add the following lines
to your `_config.yml` in order to tell Jekyll to use the plugin:

```yaml
plugins:
  - jekyll-workbox-plugin
```

Finally you need to create a template `sw.js` file, which looks something like this:

```javascript
// sw.js

// set names for both precache & runtime cache
workbox.core.setCacheNameDetails({
    prefix: 'my.site.tld',
    suffix: 'v1',
    precache: 'precache',
    runtime: 'runtime-cache'
});

// let Workbox handle our precache list
// NOTE: This will be populated by jekyll-workbox-plugin.
workbox.precaching.precacheAndRoute([]);
```

It's important to have the `workbox.precaching.precacheAndRoute([])` in there, which `jekyll-workbox-plugin`
will automatically populate.

## Update

I've switched my [website](https://benediktmeurer.de) to use the [11ty](https://11ty.io) static site
generator instead of [Jekyll](https://jekyllrb.com), mostly because I like to learn more about the
JavaScript ecosystem first-hand, while still using a static site generator. So I'm no longer using
this plugin myself.
