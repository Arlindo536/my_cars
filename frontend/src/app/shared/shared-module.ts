import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarCard } from './car-card/car-card';
import { CarPlaceholder } from './car-placeholder/car-placeholder';

@NgModule({
  declarations: [CarCard, CarPlaceholder],
  imports: [CommonModule, RouterModule],
  exports: [CarCard, CarPlaceholder],
})
export class SharedModule {}
