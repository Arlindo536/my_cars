import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { AdminCarList } from './admin-car-list/admin-car-list';

const routes: Routes = [
  { path: 'users', component: UserList },
  { path: 'cars', component: AdminCarList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}