import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarRoutingModule } from './car-routing-module';
import { CarList } from './car-list/car-list';
import { CarForm } from './car-form/car-form';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CarList, CarForm],
  imports: [CommonModule, CarRoutingModule, ReactiveFormsModule],
})
export class CarModule {}
