export const THEME_KEY = 'jiangxiang-theme';

export const themeBootstrap = String.raw`
(function () {
  var key = 'jiangxiang-theme';
  var root = document.documentElement;
  try {
    var stored = localStorage.getItem(key);
    var pref = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.themePref = pref;
  } catch (e) {
    root.dataset.theme = 'light';
    root.dataset.themePref = 'system';
  }
})();
`;
