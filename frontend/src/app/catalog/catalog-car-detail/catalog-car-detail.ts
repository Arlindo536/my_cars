import { Component, DestroyRef, ElementRef, Injector, OnDestroy, OnInit, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Catalog } from '../catalog';
import { CatalogCar, fuelIcon } from '../../shared/car-labels';
import { Language } from '../../language';

// Below this width the booking card lives in a bottom sheet opened from a fixed bar
const WIDE_QUERY = '(min-width: 992px)';
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-catalog-car-detail',
  standalone: false,
  templateUrl: './catalog-car-detail.html',
  styleUrl: './catalog-car-detail.css'
})
export class CatalogCarDetail implements OnInit, OnDestroy {
  private catalog = inject(Catalog);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  readonly language = inject(Language);

  readonly car = signal<CatalogCar | null>(null);
  readonly similar = signal<CatalogCar[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly failed = signal(false);

  readonly wide = signal(true);
  readonly sheetOpen = signal(false);
  private media?: MediaQueryList;
  private readonly onMediaChange = (e: MediaQueryListEvent) => {
    this.wide.set(e.matches);
    this.updateBottomBar();
    if (e.matches) {
      this.closeSheet();
    }
  };

  private sheet = viewChild<ElementRef<HTMLElement>>('sheet');
  private sheetToggle = viewChild<ElementRef<HTMLButtonElement>>('sheetToggle');

  ngOnInit() {
    this.media = window.matchMedia?.(WIDE_QUERY);
    this.wide.set(this.media?.matches ?? true);
    this.media?.addEventListener('change', this.onMediaChange);

    // The component stays when moving to another car (similar cars), so follow the id
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
  }

  ngOnDestroy() {
    this.media?.removeEventListener('change', this.onMediaChange);
    document.documentElement.classList.remove('scroll-locked', 'has-bottom-bar');
  }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.closeSheet();
    this.car.set(null);
    this.similar.set([]);
    this.loading.set(true);
    this.notFound.set(false);
    this.failed.set(false);
    this.updateBottomBar();
    this.catalog.getCar(id).subscribe({
      next: car => {
        this.car.set(car);
        this.loading.set(false);
        this.updateBottomBar();
        this.loadSimilar(car);
      },
      error: err => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.failed.set(true);
        }
        this.loading.set(false);
      }
    });
  }

  openSheet() {
    this.sheetOpen.set(true);
    document.documentElement.classList.add('scroll-locked');
    afterNextRender(() => this.focusables()[0]?.focus(), { injector: this.injector });
  }

  closeSheet(returnFocus = false) {
    if (!this.sheetOpen()) {
      return;
    }
    this.sheetOpen.set(false);
    document.documentElement.classList.remove('scroll-locked');
    if (returnFocus) {
      this.sheetToggle()?.nativeElement.focus();
    }
  }

  // Focus trap and Escape for the bottom sheet (the datepicker popup is outside it and handles its own keys)
  onSheetKeydown(event: KeyboardEvent) {
    if (this.wide() || !this.sheetOpen()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSheet(true);
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const items = this.focusables();
    if (items.length === 0) {
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // "Message the owner" inside the sheet: close it first, then scroll to the form (the page was scroll-locked)
  onSheetClick(event: Event) {
    if (!this.sheetOpen() || !(event.target as HTMLElement).closest('a[href="#pyet"]')) {
      return;
    }
    this.closeSheet();
    const box = document.getElementById('pyet');
    box?.scrollIntoView({ block: 'center' });
    box?.querySelector<HTMLElement>('textarea, button')?.focus({ preventScroll: true });
  }

  readonly fuelIcon = fuelIcon;

  // Same type, cheapest first, without this car (public catalog endpoint, first page only)
  private loadSimilar(car: CatalogCar) {
    this.catalog.getCars({ type: car.type, ordering: 'price_per_day' }).subscribe({
      next: page => this.similar.set(page.results.filter(c => c.id !== car.id).slice(0, 3)),
      error: () => this.similar.set([]),
    });
  }

  // Room for the fixed bar at the bottom of narrow screens (body padding, toast offset)
  private updateBottomBar() {
    document.documentElement.classList.toggle('has-bottom-bar', !this.wide() && !!this.car());
  }

  private focusables(): HTMLElement[] {
    const sheet = this.sheet()?.nativeElement;
    return sheet ? Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null) : [];
  }
}
