import { Component, inject } from '@angular/core';
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
}
