import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarRoutingModule } from './car-routing-module';
import { CarList } from './car-list/car-list';
import { CarForm } from './car-form/car-form';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CarDetail } from './car-detail/car-detail';

@NgModule({
  declarations: [CarList, CarForm, CarDetail],
  imports: [CommonModule, CarRoutingModule, ReactiveFormsModule, FormsModule],
})
export class CarModule {}
