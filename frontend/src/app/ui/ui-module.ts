import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { EmptyState } from './empty-state/empty-state';
import { FieldError } from './field-error/field-error';
import { PasswordToggle } from './password-toggle';
import { Reveal } from './reveal';
import { Skeleton } from './skeleton/skeleton';
import { StatusBadge } from './status-badge/status-badge';

// Small building blocks with no heavy dependencies: safe for the eager app shell and every feature module
@NgModule({
  declarations: [EmptyState, FieldError, PasswordToggle, Reveal, Skeleton, StatusBadge],
  imports: [CommonModule, TranslatePipe],
  exports: [EmptyState, FieldError, PasswordToggle, Reveal, Skeleton, StatusBadge],
})
export class UiModule {}
