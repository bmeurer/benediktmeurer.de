module.exports = {
  globDirectory: '_site/',
  globPatterns: [
    '**/*.{css,js}',
    'images/icons.svg',
    'favicon.ico',
  ],
  swDest: '_site/sw.js',
  swSrc: 'sw.js',
  templatedUrls: {
    '/': [ 'index.html', ],
  },
};
