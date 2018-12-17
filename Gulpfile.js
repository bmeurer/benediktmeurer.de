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
    .injectManifest({
      globDirectory: destDir,
      globPatterns: ["**/*.{css,js}", "images/icons.svg", "favicon.ico"],
      swDest: `${destDir}/sw.js`,
      swSrc: `${srcDir}/sw.js`,
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
    })
    .then(() => {
      console.info("Service worker generation completed.");
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
  return gulp.src(`${srcDir}/{{files,images}/**/*.*,favicon.ico,robots.txt}`)
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
