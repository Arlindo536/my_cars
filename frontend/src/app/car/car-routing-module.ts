import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarList } from './car-list/car-list';
import { CarForm } from './car-form/car-form';
import { CarDetail } from './car-detail/car-detail';

const routes: Routes = [
  { path: '', component: CarList },
  { path: 'new', component: CarForm },
  { path: ':id', component: CarDetail },
  { path: ':id/edit', component: CarForm }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarRoutingModule {}