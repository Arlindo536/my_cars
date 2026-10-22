import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Messages } from './messages';

describe('Messages', () => {
  let service: Messages;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Messages);
    http = TestBed.inject(HttpTestingController);
  });

  it('polls only for messages after the last known id', () => {
    service.getThread(4, 17).subscribe();
    const req = http.expectOne(r => r.url.endsWith('/messages/conversations/4/messages/'));
    expect(req.request.params.get('after')).toBe('17');
    req.flush({ conversation: {}, messages: [] });
    http.verify();
  });

  it('stores the unread count for the nav-bar badge', () => {
    service.refreshUnread().subscribe();
    http.expectOne(r => r.url.endsWith('/messages/unread/')).flush({ unread: 3 });
    expect(service.unread()).toBe(3);
  });
});
