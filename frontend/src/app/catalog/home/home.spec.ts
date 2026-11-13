import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideTestTranslations } from '../../../testing/translate';

import { CatalogModule } from '../catalog-module';
import { Catalog, CatalogFilters } from '../catalog';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;
  let calls: CatalogFilters[];

  beforeEach(async () => {
    calls = [];
    const catalog = {
      getCars: (filters: CatalogFilters) => {
        calls.push(filters);
        return of({ count: 0, next: null, previous: null, results: [] });
      },
    };
    await TestBed.configureTestingModule({
      imports: [CatalogModule],
      providers: [provideRouter([]), provideTestTranslations(), { provide: Catalog, useValue: catalog }],
    }).compileComponents();
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('loads with the default filters', () => {
    expect(calls.length).toBe(1);
    expect(calls[0]).toEqual(partial({ fuel: '', ordering: 'price_per_day', page: 1 }));
  });

  it('chips toggle a filter and show it as a removable pill', async () => {
    component.setFilter('fuel', 'electric');
    expect(calls.at(-1)?.fuel).toBe('electric');
    expect(component.activeFilters()).toEqual([{ key: 'fuel', labelKey: 'fuel.electric' }]);
    await fixture.whenStable();
    const pill: HTMLElement = fixture.nativeElement.querySelector('.active-pill');
    expect(pill.textContent).toContain('Elektrike');

    // Choosing the active chip again goes back to "all"
    component.setFilter('fuel', 'electric');
    expect(calls.at(-1)?.fuel).toBe('');
    expect(component.activeFilters()).toEqual([]);
  });

  it('keeps the chips folded until the filter button opens them, and counts active chips', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const panel = el.querySelector<HTMLElement>('#filter-panel')!;
    const toggle = el.querySelector<HTMLButtonElement>('.filter-toggle')!;
    expect(panel.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(panel.hidden).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    component.setFilter('fuel', 'diesel');
    component.setFilter('search', 'golf');
    await fixture.whenStable();
    // the search text is not a chip, so the button counts 1
    expect(component.chipCount()).toBe(1);
    expect(el.querySelector('.filter-count')?.textContent).toContain('1');
  });

  it('clear all reloads once and keeps the sort order', () => {
    component.filters.patchValue({ type: 'suv', ordering: '-year' });
    const before = calls.length;
    component.clearFilters();
    expect(calls.length).toBe(before + 1);
    expect(calls.at(-1)).toEqual(partial({ type: '', ordering: '-year' }));
    expect(component.activeFilters()).toEqual([]);
  });
});

// Partial match (expect.objectContaining)
function partial(partial: Record<string, unknown>) {
  return expect.objectContaining(partial);
}
