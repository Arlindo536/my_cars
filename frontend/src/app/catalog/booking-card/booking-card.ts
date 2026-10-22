import { Component, DestroyRef, Input, OnInit, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, debounceTime, filter, switchMap } from 'rxjs';
import { CatalogCar } from '../../shared/car-labels';
import { BookedRange, Bookings, Quote, fromApiDate, toApiDate } from '../../booking/bookings';
import { Notification } from '../../notification';
import { Language } from '../../language';

@Component({
  selector: 'app-booking-card',
  standalone: false,
  templateUrl: './booking-card.html',
  styleUrl: './booking-card.css'
})
export class BookingCard implements OnInit {
  @Input({ required: true }) car!: CatalogCar;

  private bookings = inject(Bookings);
  private router = inject(Router);
  private notification = inject(Notification);
  private destroyRef = inject(DestroyRef);
  readonly language = inject(Language);

  constructor() {
    // Month and weekday names in the calendar follow the chosen language
    const dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
    effect(() => dateAdapter.setLocale(this.language.intlLocale()));
  }

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  readonly minDate = startOfToday();
  readonly booked = signal<BookedRange[]>([]);
  readonly quote = signal<Quote | null>(null);
  readonly quoteError = signal(false);
  readonly submitting = signal(false);

  get role(): string | null {
    return localStorage.getItem('role');
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Greys out past days and days on which the car is already out
  readonly dateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false;
    }
    if (date < this.minDate) {
      return false;
    }
    return !this.booked().some(r => date >= fromApiDate(r.start_date) && date < fromApiDate(r.end_date));
  };

  ngOnInit() {
    this.loadAvailability();

    this.range.valueChanges
      .pipe(
        debounceTime(150),
        filter(() => {
          this.quote.set(null);
          this.quoteError.set(false);
          return this.hasCompleteRange();
        }),
        // Errors are handled per request so the stream keeps working for the next range
        switchMap(() => this.bookings.getQuote(this.request()).pipe(
          catchError(() => {
            this.quoteError.set(true);
            return EMPTY;
          }),
        )),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(quote => this.quote.set(quote));
  }

  book() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/catalog/${this.car.id}` } });
      return;
    }
    if (!this.hasCompleteRange() || !this.quote()?.available) {
      return;
    }
    this.submitting.set(true);
    this.bookings.createBooking(this.request()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notification.success(this.language.t('booking.sent'));
        this.router.navigate(['/bookings']);
      },
      error: err => {
        this.submitting.set(false);
        if (err.status === 409) {
          this.notification.error(this.language.t('booking.conflict'));
          this.range.reset();
          this.loadAvailability();
        } else {
          this.notification.error(this.language.t('booking.failed'));
        }
      }
    });
  }

  private loadAvailability() {
    this.bookings.getAvailability(this.car.id).subscribe({
      next: data => this.booked.set(data.booked),
      // Without availability the server still rejects overlaps; just show all days
      error: () => this.booked.set([]),
    });
  }

  private hasCompleteRange(): boolean {
    const { start, end } = this.range.getRawValue();
    return !!start && !!end && end > start;
  }

  private request() {
    const { start, end } = this.range.getRawValue();
    return { car_id: this.car.id, start_date: toApiDate(start!), end_date: toApiDate(end!) };
  }
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
