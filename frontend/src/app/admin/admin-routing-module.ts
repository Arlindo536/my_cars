import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { AdminCarList } from './admin-car-list/admin-car-list';
import { UserForm } from './user-form/user-form';
import { UserCreate } from './user-create/user-create';
import { AdminCarCreate } from './admin-car-create/admin-car-create';
import { UserDetail } from './user-detail/user-detail';

const routes: Routes = [
  { path: 'users', component: UserList },
  { path: 'users/new', component: UserCreate },
  { path: 'users/:id', component: UserDetail },
  { path: 'users/:id/edit', component: UserForm },
  { path: 'cars', component: AdminCarList },
  { path: 'cars/new', component: AdminCarCreate }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}