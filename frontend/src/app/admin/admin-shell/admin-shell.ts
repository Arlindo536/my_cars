import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { Messages } from '../../messages/messages';

export interface Crumb {
  label: string; // translation key
  link?: string;
}

const COLLAPSED_KEY = 'adminSidebar';

// Frame for every admin page: collapsible sidebar (wide screens; the header drawer covers phones)
// and breadcrumbs from each route's `data.breadcrumb`.
@Component({
  selector: 'app-admin-shell',
  standalone: false,
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css'
})
export class AdminShell implements OnInit {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  readonly messages = inject(Messages);

  readonly collapsed = signal(readCollapsed());
  readonly crumbs = signal<Crumb[]>([]);

  readonly links = [
    { path: '/admin/bookings', icon: 'event_note', label: 'nav.adminBookings' },
    { path: '/admin/cars', icon: 'directions_car', label: 'nav.fleet' },
    { path: '/admin/users', icon: 'group', label: 'nav.users' },
    { path: '/messages', icon: 'chat_bubble_outline', label: 'nav.messages' },
  ];

  ngOnInit() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.crumbs.set(leafData(this.router.routerState.snapshot.root)));
  }

  toggle() {
    this.collapsed.update(c => !c);
    try {
      localStorage.setItem(COLLAPSED_KEY, this.collapsed() ? '1' : '0');
    } catch {
      // not remembered, still toggled
    }
  }
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function leafData(route: ActivatedRouteSnapshot): Crumb[] {
  let current = route;
  while (current.firstChild) {
    current = current.firstChild;
  }
  return (current.data['breadcrumb'] as Crumb[] | undefined) ?? [];
}
