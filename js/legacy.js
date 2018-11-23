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
})();
