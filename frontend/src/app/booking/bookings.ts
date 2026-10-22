import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface BookingItem {
  id: number;
  car: { id: number; model: string; year: number };
  customer: string;
  start_date: string;
  end_date: string;
  days: number;
  total_price: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  created_at: string;
}

export interface BookingPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: BookingItem[];
}

export interface Quote {
  car_id: number;
  start_date: string;
  end_date: string;
  days: number;
  price_per_day: string;
  total_price: string;
  available: boolean;
}

export interface BookedRange {
  start_date: string;
  end_date: string;
}

export interface BookingRequest {
  car_id: number;
  start_date: string;
  end_date: string;
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Në pritje',
  confirmed: 'E konfirmuar',
  rejected: 'E refuzuar',
  cancelled: 'E anuluar',
};

// "YYYY-MM-DD" in local time (toISOString would shift the day in UTC)
export function toApiDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Parses "YYYY-MM-DD" as a local date
export function fromApiDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

@Injectable({
  providedIn: 'root'
})
export class Bookings {
  private apiUrl = `${environment.apiUrl}/bookings/`;

  constructor(private http: HttpClient) {}

  getBookings(page: number = 1, status: string = '') {
    let params = new HttpParams().set('page', page);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<BookingPage>(this.apiUrl, { params });
  }

  createBooking(request: BookingRequest) {
    return this.http.post<BookingItem>(this.apiUrl, request);
  }

  cancelBooking(id: number) {
    return this.http.post<BookingItem>(`${this.apiUrl}${id}/cancel/`, {});
  }

  getQuote(request: BookingRequest) {
    return this.http.post<Quote>(`${this.apiUrl}quote/`, request);
  }

  getAvailability(carId: number) {
    return this.http.get<{ car_id: number; booked: BookedRange[] }>(
      `${environment.apiUrl}/cars/${carId}/availability/`
    );
  }
}
