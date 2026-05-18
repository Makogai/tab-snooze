/** Makogai extension suite — shared docs theme key across projects */
(function () {
  const KEY = 'mk-docs-theme';
  try {
    const pref = localStorage.getItem(KEY) || 'system';
    let resolved = 'light';
    if (pref === 'dark') resolved = 'dark';
    else if (pref === 'light') resolved = 'light';
    else resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch {
    /* ignore */
  }
})();
