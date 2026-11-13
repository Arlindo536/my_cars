// Runs before the first paint (loaded from index.html; CSP allows 'self' scripts only, so it can't be inline).
// Keep in sync with src/app/theme.ts.
(function () {
  var pref = null;
  try {
    pref = localStorage.getItem('theme');
  } catch (e) {
    // storage blocked: follow the system
  }
  var dark =
    pref === 'dark' ||
    (pref !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var root = document.documentElement;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
})();
