// Sidebar toggle
const toggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('#sidebar');
const checkbox = document.querySelector('#sidebar-checkbox');
document.addEventListener('click', event => {
  const target = event.target;
  if (checkbox.checked &&
      !sidebar.contains(target) &&
      target !== checkbox && target !== toggle) {
    checkbox.checked = false;
  }
}, false);

// Remove UTM garbage from URLs, to make it less likely such links get shared.
if (location.search.includes('utm_source')) {
  // This site doesn’t use query string parameters anyway, so we can just
  // set the location to `location.pathname` directly.
  history.replaceState({}, '', location.pathname);
}

// Google Analytics.
const UA_ID = 'UA-24476004-1';
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
  'referrer': document.referrer.split('?')[0],
});
const firstScript = document.scripts[0];
const scriptElement = document.createElement('script');
scriptElement.src = `https://www.googletagmanager.com/gtag/js?id=${UA_ID}`;
firstScript.parentNode.insertBefore(scriptElement, firstScript);
