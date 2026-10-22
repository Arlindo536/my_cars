import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MessagesRoutingModule } from './messages-routing-module';
import { Inbox } from './inbox/inbox';
import { Thread } from './thread/thread';

@NgModule({
  declarations: [Inbox, Thread],
  imports: [CommonModule, ReactiveFormsModule, MessagesRoutingModule, TranslatePipe],
})
export class MessagesModule {}
