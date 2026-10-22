import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Inbox } from './inbox/inbox';
import { Thread } from './thread/thread';

const routes: Routes = [
  { path: '', component: Inbox },
  { path: ':id', component: Thread },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule {}
