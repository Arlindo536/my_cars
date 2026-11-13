import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { AdminCarList } from './admin-car-list/admin-car-list';
import { UserForm } from './user-form/user-form';
import { UserCreate } from './user-create/user-create';
import { AdminCarForm } from './admin-car-form/admin-car-form';
import { AdminBookings } from './admin-bookings/admin-bookings';
import { UserDetail } from './user-detail/user-detail';
import { AdminShell } from './admin-shell/admin-shell';

const users = { label: 'nav.users', link: '/admin/users' };
const fleet = { label: 'nav.fleet', link: '/admin/cars' };

// Every admin page sits inside AdminShell (sidebar + breadcrumbs from data.breadcrumb)
const routes: Routes = [
  {
    path: '',
    component: AdminShell,
    children: [
      { path: 'users', component: UserList, data: { breadcrumb: [users] } },
      { path: 'users/new', component: UserCreate, data: { breadcrumb: [users, { label: 'users.createTitle' }] } },
      { path: 'users/:id', component: UserDetail, data: { breadcrumb: [users, { label: 'users.detailTitle' }] } },
      { path: 'users/:id/edit', component: UserForm, data: { breadcrumb: [users, { label: 'users.editTitle' }] } },
      { path: 'cars', component: AdminCarList, data: { breadcrumb: [fleet] } },
      { path: 'cars/new', component: AdminCarForm, data: { breadcrumb: [fleet, { label: 'admin.newCar' }] } },
      { path: 'cars/:id/edit', component: AdminCarForm, data: { breadcrumb: [fleet, { label: 'admin.editCar' }] } },
      { path: 'bookings', component: AdminBookings, data: { breadcrumb: [{ label: 'nav.adminBookings' }] } },
      { path: '', redirectTo: 'bookings', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}