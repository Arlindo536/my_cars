import { Component, Input } from '@angular/core';

// Icon per status, so the state never depends on colour alone
const ICONS: Record<string, string> = {
  pending: 'schedule',
  confirmed: 'check_circle',
  rejected: 'cancel',
  cancelled: 'block',
  listed: 'visibility',
  hidden: 'visibility_off',
};

@Component({
  selector: 'app-status-badge',
  standalone: false,
  template: `
    <span class="status" [attr.data-status]="status">
      <i class="material-icons" aria-hidden="true">{{ icon }}</i><span class="status-label"><ng-content></ng-content></span>
    </span>
  `,
  styles: `
    :host { display: inline-block; justify-self: start; }
    .status { display: inline-flex; align-items: center; gap: 0.3rem; }
    .material-icons { font-size: 0.95rem; }
  `,
})
export class StatusBadge {
  @Input() status = '';

  get icon(): string {
    return ICONS[this.status] ?? 'info';
  }
}
