import { TestBed } from '@angular/core/testing';
import { provideTestTranslations } from '../testing/translate';

import { Notification } from './notification';

describe('Notification', () => {
  let service: Notification;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTestTranslations()] });
    service = TestBed.inject(Notification);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
