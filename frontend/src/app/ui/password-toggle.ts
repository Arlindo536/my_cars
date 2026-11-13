import { Directive, HostBinding, HostListener, Input, inject } from '@angular/core';
import { Language } from '../language';

// Show/hide button for a password input:
// <input #pw type="password" ...><button type="button" [appPasswordToggle]="pw"></button>
@Directive({
  selector: 'button[appPasswordToggle]',
  standalone: false,
  host: { class: 'password-toggle', type: 'button' },
})
export class PasswordToggle {
  @Input({ required: true }) appPasswordToggle!: HTMLInputElement;
  private language = inject(Language);
  private visible = false;

  @HostBinding('attr.aria-pressed') get pressed() {
    return this.visible;
  }

  @HostBinding('attr.aria-label') get label() {
    return this.language.t(this.visible ? 'auth.hidePassword' : 'auth.showPassword');
  }

  @HostBinding('innerHTML') get icon() {
    return `<i class="material-icons" aria-hidden="true">${this.visible ? 'visibility_off' : 'visibility'}</i>`;
  }

  @HostListener('click') toggle() {
    this.visible = !this.visible;
    this.appPasswordToggle.type = this.visible ? 'text' : 'password';
  }
}
