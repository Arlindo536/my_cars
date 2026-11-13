import { ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

// Inline validation message (icon + text) under a field, shown once the field was touched.
// Link it from the input with aria-describedby="<errorId>".
@Component({
  selector: 'app-field-error',
  standalone: false,
  template: `
    <p *ngIf="message as m" class="field-error" [id]="errorId">
      <i class="material-icons" aria-hidden="true">error_outline</i>{{ m | translate }}
    </p>
  `,
  styles: `
    .field-error {
      display: flex; align-items: center; gap: 0.3rem;
      color: var(--error); font-size: var(--fs-sm); font-weight: 500;
      margin: 0.35rem 0 0;
    }
    .material-icons { font-size: 1rem; flex-shrink: 0; }
  `,
})
export class FieldError implements OnChanges {
  @Input({ required: true }) control!: AbstractControl | null;
  @Input({ required: true }) errorId!: string;
  /** Extra message keys per error name, e.g. { mismatch: 'auth.passwordMismatch' } */
  @Input() messages: Record<string, string> = {};

  private cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.sub?.unsubscribe());
  }

  // Touched/value/status changes made in code (markAllAsTouched on submit) also refresh the message
  ngOnChanges() {
    this.sub?.unsubscribe();
    this.sub = this.control?.events.subscribe(() => this.cdr.markForCheck());
  }

  get message(): string | null {
    const c = this.control;
    if (!c || !c.errors || !c.touched) {
      return null;
    }
    const name = Object.keys(c.errors)[0];
    return this.messages[name] ?? `validation.${name}`;
  }
}
