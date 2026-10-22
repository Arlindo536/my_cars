import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing-module';
import { UserList } from './user-list/user-list';
import { AdminCarList } from './admin-car-list/admin-car-list';
import { UserForm } from './user-form/user-form';
import { UserCreate } from './user-create/user-create';
import { AdminCarForm } from './admin-car-form/admin-car-form';
import { AdminBookings } from './admin-bookings/admin-bookings';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared-module';
import { UserDetail } from './user-detail/user-detail';

@NgModule({
  declarations: [UserList, AdminCarList, UserForm, UserCreate, AdminCarForm, UserDetail, AdminBookings],
  imports: [CommonModule, AdminRoutingModule, ReactiveFormsModule, FormsModule, MatDialogModule, TranslatePipe, SharedModule],
})
export class AdminModule {}
