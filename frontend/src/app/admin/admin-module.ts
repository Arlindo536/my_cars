import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { UserList } from './user-list/user-list';
import { AdminCarList } from './admin-car-list/admin-car-list';

@NgModule({
  declarations: [UserList, AdminCarList],
  imports: [CommonModule, AdminRoutingModule],
})
export class AdminModule {}
