// Runs before the first paint (loaded from index.html; CSP allows 'self' scripts only, so it can't be inline).
// Keep in sync with src/app/theme.ts and src/app/language.ts.
(function () {
  var pref = null;
  var lang = null;
  try {
    pref = localStorage.getItem('theme');
    lang = localStorage.getItem('lang');
  } catch (e) {
    // storage blocked: follow the system, default language
  }
  var dark =
    pref === 'dark' ||
    (pref !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var root = document.documentElement;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-bs-theme', dark ? 'dark' : 'light');

  // Start downloading the translations now instead of after the app bundle runs (the first render waits for them)
  if (lang !== 'en' && lang !== 'de') {
    lang = 'sq';
  }
  root.lang = lang;
  var link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'fetch';
  link.crossOrigin = 'anonymous';
  link.href = 'i18n/' + lang + '.json';
  document.head.appendChild(link);
})();
