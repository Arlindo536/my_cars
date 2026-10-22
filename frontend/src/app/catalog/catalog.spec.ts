import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Catalog } from './catalog';

describe('Catalog', () => {
  let service: Catalog;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Catalog);
    http = TestBed.inject(HttpTestingController);
  });

  it('sends only the filters that are set', () => {
    service.getCars({ search: 'golf', type: '', fuel: 'diesel', page: 2 }).subscribe();
    const req = http.expectOne(r => r.url.endsWith('/cars/catalog/'));
    expect(req.request.params.keys().sort()).toEqual(['fuel', 'page', 'search']);
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ count: 0, next: null, previous: null, results: [] });
    http.verify();
  });
});
