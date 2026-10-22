import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, merge } from 'rxjs';
import { Catalog, CatalogFilters } from '../catalog';
import { environment } from '../../../environments/environment';
import { CAR_TYPES, CatalogCar, FUEL_TYPES, TRANSMISSION_TYPES } from '../../shared/car-labels';

const PAGE_SIZE = 9;

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
    document.getElementById('makinat')?.scrollIntoView({ behavior: 'smooth' });
  }

  clearFilters() {
    this.filters.reset({ search: '', type: '', fuel: '', transmission: '', ordering: 'price_per_day' }, { emitEvent: false });
    this.page.set(1);
    this.load();
  }

  get hasActiveFilters(): boolean {
    const { search, type, fuel, transmission } = this.filters.getRawValue();
    return !!(search || type || fuel || transmission);
  }

  scrollToCars() {
    document.getElementById('makinat')?.scrollIntoView({ behavior: 'smooth' });
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
