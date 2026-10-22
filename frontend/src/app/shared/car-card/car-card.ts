import { Component, Input, inject } from '@angular/core';
import { CatalogCar } from '../car-labels';
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
}
