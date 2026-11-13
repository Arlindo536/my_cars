import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { CatalogCarDetail } from './catalog-car-detail/catalog-car-detail';

const routes: Routes = [
  // overlayHeader: the nav bar starts transparent over the hero
  { path: '', component: Home, pathMatch: 'full', data: { overlayHeader: true } },
  { path: 'catalog/:id', component: CatalogCarDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule {}
