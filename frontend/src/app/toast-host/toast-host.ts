import { Component, inject } from '@angular/core';
import { Notification } from '../notification';

@Component({
  selector: 'app-toast-host',
  standalone: false,
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css'
})
export class ToastHost {
  readonly notification = inject(Notification);
}
