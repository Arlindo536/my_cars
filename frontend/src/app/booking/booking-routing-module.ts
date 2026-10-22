import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyBookings } from './my-bookings/my-bookings';

const routes: Routes = [
  { path: '', component: MyBookings },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule {}
