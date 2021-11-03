(function() {
  // Sidebar toggle
  var toggle = document.querySelector(".sidebar-toggle");
  var sidebar = document.querySelector("#sidebar");
  var checkbox = document.querySelector("#sidebar-checkbox");
  document.addEventListener(
    "click",
    function(event) {
      var target = event.target;
      if (
        checkbox.checked &&
        !sidebar.contains(target) &&
        target !== checkbox &&
        target !== toggle
      ) {
        checkbox.checked = false;
      }
    },
    false
  );

  // Remove UTM garbage from URLs, to make it less likely such links get shared.
  if (location.search.indexOf("utm_source") > -1) {
    // This site doesn’t use query string parameters anyway, so we can just
    // set the location to `location.pathname` directly.
    history.replaceState({}, "", location.pathname);
  }

  // Google Analytics.
  /*
  self.ga =
    self.ga ||
    function() {
      (ga.q = ga.q || []).push(arguments);
    };
  ga.l = +new Date();
  ga("create", "UA-24476004-1", "auto");
  ga("set", "referrer", document.referrer.split("?")[0]);
  ga("send", "pageview");
  var firstScript = document.scripts[0];
  var scriptElement = document.createElement("script");
  scriptElement.src = "//www.google-analytics.com/analytics.js";
  firstScript.parentNode.insertBefore(scriptElement, firstScript);
  */

  // Install the service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("/sw.js");
    });
  }
})();
