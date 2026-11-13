import { TestBed } from '@angular/core/testing';

import { Notification } from './notification';

describe('Notification', () => {
  let service: Notification;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(Notification);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stacks toasts and dismisses them after their duration', () => {
    service.success('Saved');
    service.error('Failed');
    expect(service.toasts().map(t => t.kind)).toEqual(['success', 'error']);

    vi.advanceTimersByTime(4000);
    expect(service.toasts().map(t => t.message)).toEqual(['Failed']);

    vi.advanceTimersByTime(2000);
    expect(service.toasts()).toEqual([]);
  });

  it('keeps a paused toast until it is resumed', () => {
    service.success('Saved');
    const id = service.toasts()[0].id;
    service.pause(id);
    vi.advanceTimersByTime(10000);
    expect(service.toasts().length).toBe(1);

    service.resume(id);
    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
  });

  it('shows at most four toasts, dropping the oldest', () => {
    ['a', 'b', 'c', 'd', 'e'].forEach(m => service.success(m));
    expect(service.toasts().map(t => t.message)).toEqual(['b', 'c', 'd', 'e']);
  });
});
