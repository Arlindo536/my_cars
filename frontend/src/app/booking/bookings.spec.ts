import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Bookings, fromApiDate, toApiDate } from './bookings';

describe('booking dates', () => {
  it('formats local dates without a UTC shift', () => {
    expect(toApiDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
    expect(toApiDate(new Date(2026, 11, 31, 0, 15))).toBe('2026-12-31');
  });

  it('round-trips API dates', () => {
    expect(toApiDate(fromApiDate('2026-03-09'))).toBe('2026-03-09');
  });
});

describe('Bookings', () => {
  it('posts a quote and reads availability', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(Bookings);
    const http = TestBed.inject(HttpTestingController);

    service.getQuote({ car_id: 3, start_date: '2026-11-01', end_date: '2026-11-04' }).subscribe();
    const quote = http.expectOne(r => r.url.endsWith('/bookings/quote/'));
    expect(quote.request.method).toBe('POST');
    quote.flush({});

    service.getAvailability(3).subscribe();
    http.expectOne(r => r.url.endsWith('/cars/3/availability/')).flush({ car_id: 3, booked: [] });
    http.verify();
  });
});
