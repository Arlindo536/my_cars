import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { UserList } from './user-list/user-list';
import { AdminCarList } from './admin-car-list/admin-car-list';
import { UserForm } from './user-form/user-form';
import { ReactiveFormsModule } from '@angular/forms';
import { UserCreate } from './user-create/user-create';
import { AdminCarCreate } from './admin-car-create/admin-car-create';

@NgModule({
  declarations: [UserList, AdminCarList, UserForm, UserCreate, AdminCarCreate],
  imports: [CommonModule, AdminRoutingModule, ReactiveFormsModule],
})
export class AdminModule {}
