import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { AdminCarList } from './admin-car-list/admin-car-list';
import { UserForm } from './user-form/user-form';
import { UserCreate } from './user-create/user-create';
import { AdminCarForm } from './admin-car-form/admin-car-form';
import { AdminBookings } from './admin-bookings/admin-bookings';
import { UserDetail } from './user-detail/user-detail';

const routes: Routes = [
  { path: 'users', component: UserList },
  { path: 'users/new', component: UserCreate },
  { path: 'users/:id', component: UserDetail },
  { path: 'users/:id/edit', component: UserForm },
  { path: 'cars', component: AdminCarList },
  { path: 'cars/new', component: AdminCarForm },
  { path: 'cars/:id/edit', component: AdminCarForm },
  { path: 'bookings', component: AdminBookings },
  { path: '', redirectTo: 'bookings', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}