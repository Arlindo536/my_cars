import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared-module';
import { CatalogCarDetail } from './catalog-car-detail/catalog-car-detail';
import { BookingCard } from './booking-card/booking-card';
import { AskOwner } from './ask-owner/ask-owner';

// The car page (/catalog/:id) in its own chunk: the Material datepicker it needs stays out of the home page
@NgModule({
  declarations: [CatalogCarDetail, BookingCard, AskOwner],
  imports: [
    CommonModule, ReactiveFormsModule, SharedModule,
    MatDatepickerModule, MatFormFieldModule, MatInputModule,
    RouterModule.forChild([{ path: '', component: CatalogCarDetail }]),
  ],
  // The adapter's locale is set from the Language service (see BookingCard)
  providers: [provideNativeDateAdapter()],
})
export class CarPageModule {}
