import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';

const routes: Routes = [
  // overlayHeader: the nav bar starts transparent over the hero
  { path: '', component: Home, pathMatch: 'full', data: { overlayHeader: true } },
  {
    path: 'catalog/:id',
    loadChildren: () => import('./car-page-module').then(m => m.CarPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule {}
