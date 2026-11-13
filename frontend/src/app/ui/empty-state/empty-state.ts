import { Component, Input } from '@angular/core';

export type EmptyIllustration = 'search' | 'error' | 'calendar' | 'inbox' | 'lost' | 'garage';

// Friendly empty / error state: small original car illustration, title, text and projected actions
@Component({
  selector: 'app-empty-state',
  standalone: false,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyState {
  @Input() illustration: EmptyIllustration = 'search';
  @Input() heading = '';
  @Input() text = '';
  /** Heading level for the outline: h2 inside a page, h1 when the state is the whole page (404) */
  @Input() level: 1 | 2 = 2;
}
