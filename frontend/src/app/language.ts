import { Injectable, computed, inject, signal } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeSq from '@angular/common/locales/sq';
import localeDe from '@angular/common/locales/de';
import { TranslateService } from '@ngx-translate/core';

registerLocaleData(localeSq, 'sq');
registerLocaleData(localeDe, 'de');

export type LangCode = 'sq' | 'en' | 'de';

export const LANGUAGES: { code: LangCode; label: string; locale: string; intlLocale: string }[] = [
  { code: 'sq', label: 'SQ', locale: 'sq', intlLocale: 'sq-AL' },
  { code: 'en', label: 'EN', locale: 'en-US', intlLocale: 'en-GB' },
  { code: 'de', label: 'DE', locale: 'de', intlLocale: 'de-DE' },
];

const STORAGE_KEY = 'lang';
const DEFAULT_LANG: LangCode = 'sq';

@Injectable({
  providedIn: 'root'
})
export class Language {
  private translate = inject(TranslateService);

  readonly current = signal<LangCode>(DEFAULT_LANG);
  private readonly info = computed(() => LANGUAGES.find(l => l.code === this.current())!);
  /** Locale id for Angular's number/date pipes */
  readonly locale = computed(() => this.info().locale);
  /** BCP 47 locale for Intl-based widgets (datepicker) */
  readonly intlLocale = computed(() => this.info().intlLocale);

  /** Called once at startup; resolves when the translations are loaded. */
  init() {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage blocked: fall back to the default language
    }
    const code = LANGUAGES.some(l => l.code === saved) ? (saved as LangCode) : DEFAULT_LANG;
    return this.apply(code);
  }

  set(code: LangCode) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // not remembered, still switched for this visit
    }
    this.apply(code).subscribe();
  }

  /** Translates a key in code (notifications, dialogs). */
  t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params) as string;
  }

  private apply(code: LangCode) {
    this.current.set(code);
    document.documentElement.lang = code;
    return this.translate.use(code);
  }
}
