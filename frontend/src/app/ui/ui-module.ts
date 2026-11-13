import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CountUp } from './count-up';
import { EmptyState } from './empty-state/empty-state';
import { FieldError } from './field-error/field-error';
import { Parallax } from './parallax';
import { PasswordToggle } from './password-toggle';
import { Reveal } from './reveal';
import { RoadArt } from './road-art/road-art';
import { Skeleton } from './skeleton/skeleton';
import { StatusBadge } from './status-badge/status-badge';

// Small building blocks with no heavy dependencies: safe for the eager app shell and every feature module
@NgModule({
  declarations: [CountUp, EmptyState, FieldError, Parallax, PasswordToggle, Reveal, RoadArt, Skeleton, StatusBadge],
  imports: [CommonModule, TranslatePipe],
  exports: [CountUp, EmptyState, FieldError, Parallax, PasswordToggle, Reveal, RoadArt, Skeleton, StatusBadge],
})
export class UiModule {}
