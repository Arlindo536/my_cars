import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CatalogRoutingModule } from './catalog-routing-module';
import { SharedModule } from '../shared/shared-module';
import { Home } from './home/home';
import { CatalogCarDetail } from './catalog-car-detail/catalog-car-detail';
import { BookingCard } from './booking-card/booking-card';

@NgModule({
  declarations: [Home, CatalogCarDetail, BookingCard],
  imports: [
    CommonModule, ReactiveFormsModule, CatalogRoutingModule, SharedModule,
    MatDatepickerModule, MatFormFieldModule, MatInputModule,
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'sq-AL' }],
})
export class CatalogModule {}
