import { Component } from '@angular/core';

// Shown where a car has no photo yet
@Component({
  selector: 'app-car-placeholder',
  standalone: false,
  template: `
    <div class="ph" role="img" [attr.aria-label]="'car.photoSoonAria' | translate">
      <svg viewBox="0 0 120 48" aria-hidden="true">
        <path
          d="M8 34c0-4 2-7 6-8l14-3 12-10c2-2 5-3 8-3h22c4 0 7 1 10 4l9 9 14 3c4 1 6 4 6 8v4c0 2-1 3-3 3h-6a10 10 0 0 0-20 0H40a10 10 0 0 0-20 0h-9c-2 0-3-1-3-3z"
        />
        <circle cx="30" cy="41" r="6" />
        <circle cx="90" cy="41" r="6" />
      </svg>
      <span>{{ 'car.photoSoon' | translate }}</span>
    </div>
  `,
  styles: `
    :host { display: block; width: 100%; height: 100%; }
    .ph {
      width: 100%; height: 100%; min-height: 10rem;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
      background: linear-gradient(135deg, #ececec 0%, #dcdcdc 100%);
      color: #8a8a8a;
    }
    svg { width: 45%; max-width: 12rem; fill: #c4c4c4; }
    span { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
  `,
})
export class CarPlaceholder {}
