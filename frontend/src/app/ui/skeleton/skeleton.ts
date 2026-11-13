import { Component, Input } from '@angular/core';

export type SkeletonVariant = 'card' | 'row' | 'detail';

// Placeholder shaped like the content it stands for, so nothing jumps when the data arrives
@Component({
  selector: 'app-skeleton',
  standalone: false,
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css'
})
export class Skeleton {
  @Input() variant: SkeletonVariant = 'row';
  @Input() count = 3;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
