import { Component, Input, inject } from '@angular/core';
import { CatalogCar } from '../car-labels';
import { Language } from '../../language';

const FUEL_ICONS: Record<string, string> = {
  petrol: 'local_gas_station',
  diesel: 'local_gas_station',
  electric: 'ev_station',
  hybrid: 'eco',
};

@Component({
  selector: 'app-car-card',
  standalone: false,
  templateUrl: './car-card.html',
  styleUrl: './car-card.css'
})
export class CarCard {
  @Input({ required: true }) car!: CatalogCar;

  readonly language = inject(Language);

  get fuelIcon(): string {
    return FUEL_ICONS[this.car.fuel_type] ?? 'local_gas_station';
  }
}
