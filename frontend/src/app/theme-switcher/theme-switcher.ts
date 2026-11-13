import { Component, computed, inject } from '@angular/core';
import { THEME_PREFS, Theme } from '../theme';

@Component({
  selector: 'app-theme-switcher',
  standalone: false,
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.css'
})
export class ThemeSwitcher {
  readonly theme = inject(Theme);
  readonly prefs = THEME_PREFS;
  // Position of the sliding indicator
  readonly activeIndex = computed(() => Math.max(0, this.prefs.findIndex(p => p.pref === this.theme.pref())));
}
