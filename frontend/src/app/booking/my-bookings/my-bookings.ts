import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookingItem, Bookings, STATUS_LABELS, fromApiDate } from '../bookings';
import { Notification } from '../../notification';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-my-bookings',
  standalone: false,
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit {
  private bookings = inject(Bookings);
  private notification = inject(Notification);
  private dialog = inject(MatDialog);

  readonly statusLabels = STATUS_LABELS;
  readonly items = signal<BookingItem[]>([]);
  readonly count = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.count() / PAGE_SIZE)));

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.failed.set(false);
    this.bookings.getBookings(this.page()).subscribe({
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

  goToPage(page: number) {
    this.page.set(page);
    this.load();
  }

  // Mirrors the server rule: active bookings that have not started yet
  canCancel(booking: BookingItem): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return ['pending', 'confirmed'].includes(booking.status) && fromApiDate(booking.start_date) > today;
  }

  cancel(booking: BookingItem) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Anulo rezervimin',
        message: `Do ta anulosh rezervimin e ${booking.car.model}? Datat do të lirohen për të tjerët.`,
        confirmLabel: 'Anulo rezervimin',
        cancelLabel: 'Mbylle',
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.bookings.cancelBooking(booking.id).subscribe({
        next: updated => {
          this.items.update(list => list.map(b => (b.id === updated.id ? updated : b)));
          this.notification.success('Rezervimi u anulua.');
        },
        error: () => this.notification.error('Rezervimi nuk u anulua. Provo përsëri.')
      });
    });
  }
}
