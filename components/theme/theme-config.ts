export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

export const THEME_STORAGE_KEY = 'projectmanagement-theme-preference';

export const THEME_INIT_SCRIPT = `
(() => {
  const storageKey = '${THEME_STORAGE_KEY}';
  const root = document.documentElement;

  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const nextTheme = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : getSystemTheme();

    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
  } catch {
    const fallbackTheme = getSystemTheme();
    root.dataset.theme = fallbackTheme;
    root.style.colorScheme = fallbackTheme;
  }
})();
`;
