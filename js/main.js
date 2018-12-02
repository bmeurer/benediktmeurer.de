(function() {
  // Sidebar toggle
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('#sidebar');
  var checkbox = document.querySelector('#sidebar-checkbox');
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (checkbox.checked &&
        !sidebar.contains(target) &&
        target !== checkbox && target !== toggle) {
      checkbox.checked = false;
    }
  }, false);

  // Remove UTM garbage from URLs, to make it less likely such links get shared.
  if (location.search.indexOf('utm_source') > -1) {
    // This site doesn’t use query string parameters anyway, so we can just
    // set the location to `location.pathname` directly.
    history.replaceState({}, '', location.pathname);
  }

  // Append bookmark links to h2-h6 inside of posts.
  window.addEventListener("load", function(event) {
    document.querySelectorAll(".post h2, .post h3, .post h4, .post h5, .post h6").forEach(function(h) {
      var t = document.createTextNode(" ");
      h.appendChild(t);
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.text = "#";
      a.setAttribute("aria-hidden", "true")
      a.setAttribute("class", "bookmark")
      h.appendChild(a);
    });
  });

  // Google Analytics.
  var UA_ID = 'UA-24476004-1';
  self.dataLayer = [];
  self.gtag = function() {
    // Note: This needs to be an actual `arguments` object. Proper arrays
    // (such as those produced by rest parameters) prevent any analytics
    // from being collected at all. :(
    self.dataLayer.push(arguments);
  };
  gtag('js', new Date());
  gtag('config', UA_ID, {
    'anonymize_ip': true,
    'referrer': document.referrer.split('?')[0]
  });
  var firstScript = document.scripts[0];
  var scriptElement = document.createElement('script');
  scriptElement.src = 'https://www.googletagmanager.com/gtag/js?id=' + UA_ID;
  firstScript.parentNode.insertBefore(scriptElement, firstScript);
})();
