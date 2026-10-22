import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CatalogRoutingModule } from './catalog-routing-module';
import { SharedModule } from '../shared/shared-module';
import { Home } from './home/home';
import { CatalogCarDetail } from './catalog-car-detail/catalog-car-detail';

@NgModule({
  declarations: [Home, CatalogCarDetail],
  imports: [CommonModule, ReactiveFormsModule, CatalogRoutingModule, SharedModule],
})
export class CatalogModule {}
