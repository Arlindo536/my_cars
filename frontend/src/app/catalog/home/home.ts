import { Component, DestroyRef, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, merge, startWith } from 'rxjs';
import { Catalog, CatalogFilters } from '../catalog';
import { environment } from '../../../environments/environment';
import { CAR_TYPES, CatalogCar, FUEL_TYPES, TRANSMISSION_TYPES } from '../../shared/car-labels';
import { scrollBehavior } from '../../motion';

const PAGE_SIZE = 9;

type ChipKey = 'type' | 'fuel' | 'transmission';
type FilterKey = ChipKey | 'search';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private catalog = inject(Catalog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  readonly office = environment.office;
  readonly hasDemo = environment.demoAccounts.length > 0;
  readonly typeOptions = CAR_TYPES;
  readonly fuelOptions = FUEL_TYPES;
  readonly transmissionOptions = TRANSMISSION_TYPES;
  readonly orderingOptions = ['price_per_day', '-price_per_day', '-year', 'model'];

  readonly filters = inject(FormBuilder).nonNullable.group({
    search: '',
    type: '',
    fuel: '',
    transmission: '',
    ordering: 'price_per_day',
  });

  // Chip rows under the heading; the hero panel binds search and type to the same controls
  readonly chipGroups: { key: ChipKey; label: string; prefix: string; options: string[] }[] = [
    { key: 'type', label: 'home.type', prefix: 'type.', options: CAR_TYPES },
    { key: 'fuel', label: 'home.fuel', prefix: 'fuel.', options: FUEL_TYPES },
    { key: 'transmission', label: 'home.transmission', prefix: 'transmission.', options: TRANSMISSION_TYPES },
  ];

  private readonly filterValue = toSignal(
    this.filters.valueChanges.pipe(
      startWith(null),
      map(() => this.filters.getRawValue()),
    ),
    { requireSync: true },
  );

  readonly activeFilters = computed(() => {
    const value = this.filterValue();
    const active: { key: FilterKey; labelKey?: string; text?: string }[] = [];
    if (value.search.trim()) {
      active.push({ key: 'search', text: value.search.trim() });
    }
    for (const group of this.chipGroups) {
      if (value[group.key]) {
        active.push({ key: group.key, labelKey: group.prefix + value[group.key] });
      }
    }
    return active;
  });

  private resultsHeading = viewChild<ElementRef<HTMLElement>>('resultsHeading');

  readonly cars = signal<CatalogCar[]>([]);
  readonly count = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.count() / PAGE_SIZE)));
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit() {
    // Restore filters from the URL so links and the back button keep them
    const params = this.route.snapshot.queryParamMap;
    this.filters.patchValue({
      search: params.get('search') ?? '',
      type: params.get('type') ?? '',
      fuel: params.get('fuel') ?? '',
      transmission: params.get('transmission') ?? '',
      ordering: params.get('ordering') ?? 'price_per_day',
    });
    this.page.set(Number(params.get('page')) || 1);

    const { search, ...selects } = this.filters.controls;
    merge(
      search.valueChanges.pipe(debounceTime(300), map(v => v.trim()), distinctUntilChanged()),
      ...Object.values(selects).map(control => control.valueChanges),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });

    this.load();
  }

  load() {
    const value = this.filters.getRawValue();
    const query: CatalogFilters = { ...value, search: value.search.trim(), page: this.page() };
    this.syncUrl(query);

    this.loading.set(true);
    this.failed.set(false);
    this.catalog.getCars(query).subscribe({
      next: data => {
        this.cars.set(data.results);
        this.count.set(data.count);
        this.loading.set(false);
      },
      error: () => {
        this.cars.set([]);
        this.count.set(0);
        this.failed.set(true);
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.page.set(page);
    this.load();
    document.getElementById('makinat')?.scrollIntoView({ behavior: scrollBehavior() });
  }

  clearFilters() {
    // One reload for the whole reset (the per-control subscription would fire once per field)
    this.filters.reset({ search: '', type: '', fuel: '', transmission: '', ordering: this.filters.controls.ordering.value }, { emitEvent: false });
    this.filters.updateValueAndValidity();
    this.page.set(1);
    this.load();
  }

  value(key: ChipKey): string {
    return this.filterValue()[key];
  }

  // Chips toggle: choosing the active one again goes back to "all"
  setFilter(key: FilterKey, option: string) {
    const control = this.filters.controls[key];
    control.setValue(key !== 'search' && control.value === option ? '' : option);
  }

  // Hero panel submit and scroll cue: move to the results and put focus on their heading
  showResults() {
    const heading = this.resultsHeading()?.nativeElement;
    document.getElementById('makinat')?.scrollIntoView({ behavior: scrollBehavior() });
    heading?.focus({ preventScroll: true });
  }

  // Updates the address bar without a router navigation (which would reload and scroll)
  private syncUrl(query: CatalogFilters) {
    const queryParams: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(query)) {
      const isDefault = (key === 'ordering' && value === 'price_per_day') || (key === 'page' && value === 1);
      if (value && !isDefault) {
        queryParams[key] = value;
      }
    }
    this.location.replaceState(this.router.createUrlTree([], { relativeTo: this.route, queryParams }).toString());
  }
}
