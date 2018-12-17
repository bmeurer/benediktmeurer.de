"use strict";

const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const jsonminify = require("gulp-jsonminify");
const postcss = require("gulp-postcss");
const shell = require("gulp-shell");
const uglify = require("gulp-uglify");
const workbox = require("workbox-build");

const destDir = `${__dirname}/_site`;
const srcDir = `${__dirname}`;

/** Builds (and optionally minifies) the HTML files */
function buildHTML(cb) {
  shell.task("eleventy", { quiet: true })(cb);
}

/** Builds (and optionally minifies) the JSON files */
function buildJSON() {
  let stream = gulp.src(`${srcDir}/manifest.json`);
  if (process.env.NODE_ENV === "production") {
    stream = stream.pipe(jsonminify());
  }
  return stream.pipe(gulp.dest(destDir));
}

/** Builds (and optionally minifies) the sw.js */
function buildServiceWorker() {
  return workbox
    .generateSW({
      skipWaiting: true,
      runtimeCaching: [
        {
          // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: "staleWhileRevalidate",
          options: { cacheName: "google-fonts-stylesheets" }
        },
        {
          // Cache the underlying font files with a cache-first strategy for 1 year.
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          handler: "cacheFirst",
          options: {
            cacheName: "google-fonts-webfonts",
            cacheableResponse: { statuses: [0, 200] },
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 365,
              maxEntries: 30
            }
          }
        }
      ],
      cacheId: "benediktmeurer.de",
      offlineGoogleAnalytics: true,
      globDirectory: destDir,
      globPatterns: [
        "css/main.css",
        "favicon.ico",
        "images/icons.svg",
        "index.html",
        "js/main.js"
      ],
      swDest: `${destDir}/sw.js`,
      templatedUrls: {
        "/": ["index.html"]
      }
    })
    .then(({ warnings }) => {
      // Log any warnings from workbox-build.
      for (const warning of warnings) {
        console.warn(warning);
      }

      // Minify the resulting sw.js for production builds.
      if (process.env.NODE_ENV === "production") {
        return gulp
          .src(`${destDir}/sw.js`)
          .pipe(uglify())
          .pipe(gulp.dest(`${destDir}`));
      }
    });
}

/** Builds (and optionally minifies) the JavaScript files */
function buildScripts() {
  let stream = gulp.src(`${srcDir}/js/*.js`);
  if (process.env.NODE_ENV === "production") {
    stream = stream.pipe(uglify());
  }
  return stream.pipe(gulp.dest(`${destDir}/js`));
}

/** Builds (and optionally minifies) the CSS files */
function buildStyles() {
  let stream = gulp.src(`${srcDir}/css/*.css`);
  if (process.env.NODE_ENV === "production") {
    const plugins = [cssnano()];
    stream = stream.pipe(postcss(plugins));
  }
  return stream.pipe(gulp.dest(`${destDir}/css`));
}

/** Copy resources */
function copyResources() {
  return gulp
    .src(`${srcDir}/{{files,images}/**/*.*,favicon.ico}`)
    .pipe(gulp.dest(destDir));
}

/** Cleans the generated artifacts */
function clean() {
  return del([destDir]);
}

const build = gulp.parallel(
  buildJSON,
  copyResources,
  gulp.series(
    gulp.parallel(buildHTML, buildScripts, buildStyles),
    buildServiceWorker
  )
);

exports.build = build;
exports.clean = clean;

exports.default = build;
