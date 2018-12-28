/**
 * Copyright (c) Benedikt Meurer @bmeurer.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const installPrismLanguages = require("./prism-languages.js");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItVideo = require("markdown-it-video");

const markdown = markdownIt({ html: true, linkify: true })
  .use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "bookmark",
    permalinkSymbol: "#"
  })
  .use(markdownItFootnote)
  .use(markdownItVideo, {
    youtube: { width: 720, height: 410 }
  });

module.exports = eleventyConfig => {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    init({ Prism }) {
      installPrismLanguages(Prism);
    }
  });

  eleventyConfig.addLayoutAlias("default", "layouts/default.njk");
  eleventyConfig.addLayoutAlias("iphoneapp", "layouts/iphoneapp.njk");
  eleventyConfig.addLayoutAlias("githubproject", "layouts/githubproject.njk");
  eleventyConfig.addLayoutAlias("page", "layouts/page.njk");
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-LL-dd");
  });
  eleventyConfig.addFilter("readableDateString", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });
  eleventyConfig.addFilter("htmlExcerpt", content => {
    if (!content) return content;
    const start = content.indexOf("<p>");
    const end = content.indexOf("</p>", start + "<p>".length);
    if (start >= 0 && end > start) {
      return content.substring(start, end + "</p>".length);
    }
    return content;
  });
  eleventyConfig.addFilter("markdown", string => {
    return markdown.renderInline(string);
  });

  // only content in the `posts/` directory
  eleventyConfig.addCollection("posts", collection => {
    return collection
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date);
  });
  eleventyConfig.addCollection("tagList", collection => {
    const set = new Set();
    for (const item of collection.getAllSorted()) {
      if ("tags" in item.data) {
        const tags = item.data.tags;
        if (typeof tags === "string") {
          set.add(tags);
        } else {
          tags.forEach(set.add.bind(set));
        }
      }
    }
    return [...set].sort();
  });

  // Markdown Plugins
  eleventyConfig.setLibrary("md", markdown);

  return {
    templateFormats: ["md", "njk"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    dataTemplateEngine: "njk",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };
};
