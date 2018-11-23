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
