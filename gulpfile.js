"use strict";

const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const jsonminify = require("gulp-jsonminify");
const merge = require("merge-stream");
const postcss = require("gulp-postcss");
const sass = require("gulp-sass");
const shell = require("gulp-shell");
const uglify = require("gulp-uglify");
const workbox = require("workbox-build");

const destDir = `${__dirname}/dist`;
const srcDir = `${__dirname}/src`;

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
      cacheId: "benediktmeurer.de",
      offlineGoogleAnalytics: true,
      globDirectory: destDir,
      globPatterns: [
        "css/main.css",
        "favicon.ico",
        "fonts/*.woff2",
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
  const plugins = [autoprefixer({ browsers: ["> 0.2%", "last 3 versions"] })];
  if (process.env.NODE_ENV === "production") plugins.push(cssnano());
  return merge(
    gulp.src(`${srcDir}/css/*.css`),
    gulp.src(`${srcDir}/css/*.scss`).pipe(sass().on("error", sass.logError))
  )
    .pipe(postcss(plugins))
    .pipe(gulp.dest(`${destDir}/css`));
}

/** Copy resources */
function copyResources() {
  return gulp
    .src(`${srcDir}/{{files,fonts,images}/**/*.*,favicon.ico}`)
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
