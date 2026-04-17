(function () {
  var root = document.documentElement;
  if (localStorage.getItem('ac-theme') === 'dark' && !root.hasAttribute('data-theme')) {
    root.setAttribute('data-theme', 'dark');
  }

  function toggle() {
    var isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      localStorage.setItem('ac-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('ac-theme', 'dark');
    }
  }

  window.toggleACTheme = toggle;

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.theme-toggle');
    if (btn) {
      e.preventDefault();
      toggle();
    }
  });
})();
