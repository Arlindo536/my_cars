import { Component, OnInit, inject, signal } from '@angular/core';
import { EMPTY, catchError, forkJoin, map } from 'rxjs';
import { Bookings } from '../../booking/bookings';
import { Messages } from '../../messages/messages';
import { Admin } from '../admin';

interface Stat {
  key: string;
  icon: string;
  label: string;
  value: number;
  link?: string;
}

// Four counters on the admin landing page, from existing list endpoints (their `count`) and the unread counter
@Component({
  selector: 'app-admin-stats',
  standalone: false,
  templateUrl: './admin-stats.html',
  styleUrl: './admin-stats.css'
})
export class AdminStats implements OnInit {
  private bookings = inject(Bookings);
  private admin = inject(Admin);
  readonly messages = inject(Messages);

  readonly stats = signal<Stat[] | null>(null);

  ngOnInit() {
    forkJoin({
      pending: this.bookings.getBookings(1, 'pending').pipe(map(p => p.count)),
      confirmed: this.bookings.getBookings(1, 'confirmed').pipe(map(p => p.count)),
      fleet: this.admin.getFleet(1).pipe(map(p => p.count)),
      unread: this.messages.refreshUnread().pipe(map(r => r.unread)),
    })
      // Counters are extra information: without them the page still works
      .pipe(catchError(() => EMPTY))
      .subscribe(c =>
        this.stats.set([
          { key: 'pending', icon: 'schedule', label: 'admin.statPending', value: c.pending },
          { key: 'confirmed', icon: 'check_circle', label: 'admin.statConfirmed', value: c.confirmed },
          { key: 'fleet', icon: 'directions_car', label: 'admin.statFleet', value: c.fleet, link: '/admin/cars' },
          { key: 'unread', icon: 'mark_chat_unread', label: 'admin.statUnread', value: c.unread, link: '/messages' },
        ]),
      );
  }
}
