import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CatalogRoutingModule } from './catalog-routing-module';
import { SharedModule } from '../shared/shared-module';
import { Home } from './home/home';

// Home page only; the car page is lazy-loaded from CarPageModule
@NgModule({
  declarations: [Home],
  imports: [CommonModule, ReactiveFormsModule, CatalogRoutingModule, SharedModule],
})
export class CatalogModule {}
