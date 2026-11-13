import { Component, Input, inject } from '@angular/core';
import { CatalogCar, fuelIcon } from '../car-labels';
import { Language } from '../../language';

@Component({
  selector: 'app-car-card',
  standalone: false,
  templateUrl: './car-card.html',
  styleUrl: './car-card.css'
})
export class CarCard {
  @Input({ required: true }) car!: CatalogCar;

  readonly language = inject(Language);

  // Shared-element transition: this card's photo morphs into the car page photo (.car-photo-vt).
  // Names must be unique per page, so skip it when a car page photo is already on screen (similar cars).
  markSharedPhoto(frame: HTMLElement) {
    if (!document.querySelector('.car-photo-vt')) {
      frame.style.setProperty('view-transition-name', 'car-photo');
    }
  }

  get fuelIcon(): string {
    return fuelIcon(this.car.fuel_type);
  }
}
