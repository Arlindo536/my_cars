import { Component, Input } from '@angular/core';
import { CatalogCar, FUEL_LABELS, TRANSMISSION_LABELS, TYPE_LABELS } from '../car-labels';

@Component({
  selector: 'app-car-card',
  standalone: false,
  templateUrl: './car-card.html',
  styleUrl: './car-card.css'
})
export class CarCard {
  @Input({ required: true }) car!: CatalogCar;

  readonly fuelLabels = FUEL_LABELS;
  readonly transmissionLabels = TRANSMISSION_LABELS;
  readonly typeLabels = TYPE_LABELS;
}
