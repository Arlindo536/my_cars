import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CarCard } from './car-card/car-card';
import { CarPlaceholder } from './car-placeholder/car-placeholder';
import { OfficeMap } from './office-map/office-map';
import { PricePipe } from './price-pipe';

@NgModule({
  declarations: [CarCard, CarPlaceholder, OfficeMap, PricePipe],
  imports: [CommonModule, RouterModule, TranslatePipe],
  exports: [CarCard, CarPlaceholder, OfficeMap, PricePipe, TranslatePipe],
})
export class SharedModule {}
