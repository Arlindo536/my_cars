import { Injectable, computed, signal } from '@angular/core';

export type ThemePref = 'system' | 'light' | 'dark';

export const THEME_PREFS: { pref: ThemePref; icon: string }[] = [
  { pref: 'light', icon: 'light_mode' },
  { pref: 'dark', icon: 'dark_mode' },
  { pref: 'system', icon: 'contrast' },
];

// Same key and logic as public/theme-init.js, which applies the theme before Angular starts
const STORAGE_KEY = 'theme';

@Injectable({
  providedIn: 'root'
})
export class Theme {
  // matchMedia is missing in some test environments (jsdom)
  private readonly media = window.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly pref = signal<ThemePref>(this.load());
  /** The theme actually shown */
  readonly resolved = computed<'light' | 'dark'>(() =>
    this.pref() === 'system' ? (this.systemDark() ? 'dark' : 'light') : (this.pref() as 'light' | 'dark'),
  );

  constructor() {
    // Lives as long as the app (root singleton), so the listener is never removed
    this.media?.addEventListener('change', e => {
      this.systemDark.set(e.matches);
      this.apply();
    });
    this.apply();
  }

  set(pref: ThemePref) {
    this.pref.set(pref);
    try {
      if (pref === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, pref);
      }
    } catch {
      // not remembered, still switched for this visit
    }
    this.apply();
  }

  private load(): ThemePref {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'light' || saved === 'dark' ? saved : 'system';
    } catch {
      return 'system';
    }
  }

  private apply() {
    const root = document.documentElement;
    root.setAttribute('data-theme', this.resolved());
    // Bootstrap 5.3 colour modes (form-select arrows, close buttons, tables)
    root.setAttribute('data-bs-theme', this.resolved());
  }
}
