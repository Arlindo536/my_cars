import { Component, computed, inject } from '@angular/core';
import { LANGUAGES, Language } from '../language';

@Component({
  selector: 'app-language-switcher',
  standalone: false,
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher {
  readonly language = inject(Language);
  readonly languages = LANGUAGES;
  // Position of the sliding indicator
  readonly activeIndex = computed(() => Math.max(0, this.languages.findIndex(l => l.code === this.language.current())));
}
