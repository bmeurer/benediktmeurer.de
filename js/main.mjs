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
