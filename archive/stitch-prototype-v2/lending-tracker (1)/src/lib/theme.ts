import { AppSettings } from '../types';

export function applyThemeClass(theme: AppSettings['theme']): void {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
    return;
  }

  if (theme === 'light') {
    root.classList.remove('dark');
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
