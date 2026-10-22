import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { BookingRoutingModule } from './booking-routing-module';
import { MyBookings } from './my-bookings/my-bookings';

@NgModule({
  declarations: [MyBookings],
  imports: [CommonModule, BookingRoutingModule, MatDialogModule, TranslatePipe],
})
export class BookingModule {}
