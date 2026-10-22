import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConversationItem {
  id: number;
  car: { id: number; model: string; year: number };
  customer: string;
  updated_at: string;
  last_message: { body: string; created_at: string; mine: boolean } | null;
  unread: number;
}

export interface ConversationPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: ConversationItem[];
}

export interface MessageItem {
  id: number;
  body: string;
  created_at: string;
  is_read: boolean;
  mine: boolean;
  sender_role: 'admin' | 'customer';
}

export interface ThreadResponse {
  conversation: ConversationItem;
  messages: MessageItem[];
}

export const MAX_MESSAGE_LENGTH = 2000;

@Injectable({
  providedIn: 'root'
})
export class Messages {
  private apiUrl = `${environment.apiUrl}/messages/`;

  /** Unread messages for the logged-in user, shown in the nav-bar */
  readonly unread = signal(0);

  constructor(private http: HttpClient) {}

  getConversations(page: number = 1) {
    return this.http.get<ConversationPage>(`${this.apiUrl}conversations/`, { params: { page } });
  }

  startConversation(carId: number, body: string) {
    return this.http.post<ConversationItem>(`${this.apiUrl}conversations/`, { car_id: carId, body });
  }

  getThread(conversationId: number, afterId?: number) {
    let params = new HttpParams();
    if (afterId) {
      params = params.set('after', afterId);
    }
    return this.http.get<ThreadResponse>(`${this.apiUrl}conversations/${conversationId}/messages/`, { params });
  }

  sendMessage(conversationId: number, body: string) {
    return this.http.post<MessageItem>(`${this.apiUrl}conversations/${conversationId}/messages/`, { body });
  }

  refreshUnread() {
    return this.http.get<{ unread: number }>(`${this.apiUrl}unread/`).pipe(tap(r => this.unread.set(r.unread)));
  }
}
