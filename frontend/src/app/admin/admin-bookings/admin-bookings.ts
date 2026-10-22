import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingItem, Bookings } from '../../booking/bookings';
import { Notification } from '../../notification';
import { Language } from '../../language';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-bookings',
  standalone: false,
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.css'
})
export class AdminBookings implements OnInit {
  private bookings = inject(Bookings);
  private notification = inject(Notification);
  readonly language = inject(Language);

  readonly filters = ['pending', 'confirmed', '', 'rejected', 'cancelled'];
  readonly status = signal('pending');
  readonly items = signal<BookingItem[]>([]);
  readonly count = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly failed = signal(false);
  /** Booking ids with a confirm/reject request in flight */
  readonly busy = signal<number[]>([]);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.count() / PAGE_SIZE)));

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.failed.set(false);
    this.bookings.getBookings(this.page(), this.status()).subscribe({
      next: data => {
        this.items.set(data.results);
        this.count.set(data.count);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      }
    });
  }

  setStatus(status: string) {
    this.status.set(status);
    this.page.set(1);
    this.load();
  }

  goToPage(page: number) {
    this.page.set(page);
    this.load();
  }

  confirm(booking: BookingItem) {
    this.decide(booking, this.bookings.confirmBooking(booking.id), 'admin.bookingConfirmed');
  }

  reject(booking: BookingItem) {
    this.decide(booking, this.bookings.rejectBooking(booking.id), 'admin.bookingRejected');
  }

  private decide(booking: BookingItem, request$: Observable<BookingItem>, successKey: string) {
    this.busy.update(ids => [...ids, booking.id]);
    request$.subscribe({
      next: updated => {
        this.busy.update(ids => ids.filter(id => id !== booking.id));
        this.notification.success(this.language.t(successKey, { model: updated.car.model, customer: updated.customer }));
        // In the "pending" view the decided booking leaves the list
        this.load();
      },
      error: () => {
        this.busy.update(ids => ids.filter(id => id !== booking.id));
        this.notification.error(this.language.t('admin.bookingDecisionFailed'));
        this.load();
      }
    });
  }
}
