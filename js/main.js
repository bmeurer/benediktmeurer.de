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

  // Install our service worker.
  if ('serviceWorker' in navigator) {
    addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(
        function(result) {
          console.log("SW registration succeeded: ", result);
        },
        function(error) {
          console.error("SW registration failed: ", error)
        });
    });
  }

  // Remove UTM garbage from URLs, to make it less likely such links get shared.
  if (location.search.indexOf('utm_source') > -1) {
    // This site doesn’t use query string parameters anyway, so we can just
    // set the location to `location.pathname` directly.
    history.replaceState({}, '', location.pathname);
  }

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
