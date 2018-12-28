## This is the data for my website

The [website](https://benediktmeurer.de) is automatically transformed by [11ty](https://www.11ty.io) into a static site.

[![Build Status](https://travis-ci.org/bmeurer/benediktmeurer.de.svg?branch=master)](https://travis-ci.org/bmeurer/benediktmeurer.de)

## Building

You'll need to have [Node.js](https://nodejs.org) installed in order to build this website. Afterwards it's the usual

```
npm install
```

to fetch dependencies for the website, and then

```
npm run build
```

to build it in development mode, or

```
env NODE_ENV=production npm run build
```

to build it in production mode (including all the minifications and optimizations). This currently uses [gulp.js](https://gulpjs.com)
to run the build tasks and [11ty](https://www.11ty.io) for the static site generation.

Once this is done, you can use

```
npm start
```

to start a webserver for the website and simply visit <http://localhost:8000> to view it.

## License

The following files and directories are Copyright (c) Benedikt Meurer. You may not reuse anything therein without my permission:

- [src/posts](https://github.com/bmeurer/benediktmeurer.de/tree/master/src/posts)

The remaining files are [MIT licensed](http://en.wikipedia.org/wiki/Mit_license) unless stated otherwise.
Feel free to reuse the HTML and CSS (based on files taken from [Mark Otto](https://twitter.com/mdo)'
[Poole](http://getpoole.com) theme for the Jekyll static site generator) as you please. If you do use them,
a link back to this [website](https://benediktmeurer.de) would be appreciated, but is not required.
