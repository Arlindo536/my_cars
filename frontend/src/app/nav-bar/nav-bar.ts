import { Component, DestroyRef, ElementRef, Injector, OnInit, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { EMPTY, catchError, filter, switchMap, timer } from 'rxjs';
import { Messages } from '../messages/messages';
import { prefersReducedMotion } from '../motion';

const UNREAD_POLL_MS = 30000;
// Scroll distance after which the bar turns solid and may hide
const SOLID_AFTER_PX = 40;
// The full menu fits inline from these widths; below them it is a drawer (admins have more links)
const INLINE_MIN_WIDTH = { guest: 992, admin: 1200 };

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
  host: {
    '(window:scroll)': 'onScroll()',
    '(window:resize)': 'onResize()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class NavBar implements OnInit {
  readonly messages = inject(Messages);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly menuOpen = signal(false);
  readonly userMenuOpen = signal(false);
  // Header states: transparent over a hero, solid + blurred after scrolling, hidden while scrolling down
  readonly overlay = signal(false);
  readonly scrolled = signal(false);
  readonly hidden = signal(false);
  private readonly width = signal(typeof window === 'undefined' ? 1280 : window.innerWidth);

  private menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private drawer = viewChild<ElementRef<HTMLElement>>('drawer');
  private userToggle = viewChild<ElementRef<HTMLButtonElement>>('userToggle');

  private lastY = 0;
  private scrollQueued = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Unread badge: refreshed while logged in and the tab is visible
    timer(0, UNREAD_POLL_MS)
      .pipe(
        filter(() => this.isLoggedIn && document.visibilityState === 'visible'),
        switchMap(() => this.messages.refreshUnread().pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // Pages whose route data has `overlayHeader` start with a hero under a transparent bar
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.overlay.set(this.routeWantsOverlay(this.router.routerState.snapshot.root));
        this.hidden.set(false);
        this.userMenuOpen.set(false);
        this.updateScroll();
      });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }

  get username(): string {
    return localStorage.getItem('username') ?? '';
  }

  // "demo_klient" -> "DK", "ana" -> "A"; empty when the name is unknown (logged in before it was stored)
  get initials(): string {
    return this.username
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  inline(): boolean {
    return this.width() >= (this.role === 'admin' ? INLINE_MIN_WIDTH.admin : INLINE_MIN_WIDTH.guest);
  }

  openMenu() {
    this.menuOpen.set(true);
    this.hidden.set(false);
    document.documentElement.classList.add('drawer-open');
    afterNextRender(() => this.focusables()[0]?.focus(), { injector: this.injector });
  }

  closeMenu(returnFocus = false) {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    document.documentElement.classList.remove('drawer-open');
    if (returnFocus) {
      this.menuToggle()?.nativeElement.focus();
    }
  }

  // Close the drawer after a link inside it is used (language/theme buttons keep it open)
  onDrawerClick(event: Event) {
    if (!this.inline() && (event.target as HTMLElement).closest('a')) {
      this.closeMenu();
    }
  }

  // Focus trap and Escape while the drawer is open
  onDrawerKeydown(event: KeyboardEvent) {
    if (this.inline() || !this.menuOpen()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu(true);
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

  toggleUserMenu() {
    this.userMenuOpen.update(open => !open);
  }

  onUserMenuKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.userMenuOpen()) {
      event.preventDefault();
      this.userMenuOpen.set(false);
      this.userToggle()?.nativeElement.focus();
    }
  }

  // Keyboard users tabbing out of the account menu close it
  onUserMenuFocusout(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && !(event.currentTarget as HTMLElement).contains(next)) {
      this.userMenuOpen.set(false);
    }
  }

  onDocumentClick(event: Event) {
    if (this.userMenuOpen() && !(event.target as HTMLElement).closest('.user-menu')) {
      this.userMenuOpen.set(false);
    }
  }

  // A hidden bar comes back as soon as something inside it gets focus
  onHeaderFocusin() {
    this.hidden.set(false);
  }

  onScroll() {
    if (this.scrollQueued) {
      return;
    }
    this.scrollQueued = true;
    requestAnimationFrame(() => {
      this.scrollQueued = false;
      this.updateScroll();
    });
  }

  onResize() {
    this.width.set(window.innerWidth);
    if (this.inline()) {
      this.closeMenu();
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.messages.unread.set(0);
    this.userMenuOpen.set(false);
    this.router.navigate(['/auth/login']);
  }

  private updateScroll() {
    const y = Math.max(window.scrollY, 0);
    this.scrolled.set(y > SOLID_AFTER_PX);
    // Hide on scroll down, show on scroll up; never while a menu is open or motion is reduced
    // (keyboard focus inside the bar keeps it visible; a clicked link keeps focus too, but without :focus-visible)
    const busy = this.menuOpen() || this.userMenuOpen() || !!this.host.nativeElement.querySelector(':focus-visible');
    if (y <= SOLID_AFTER_PX * 2 || busy || prefersReducedMotion()) {
      this.hidden.set(false);
    } else if (y > this.lastY + 4) {
      this.hidden.set(true);
    } else if (y < this.lastY - 4) {
      this.hidden.set(false);
    }
    this.lastY = y;
  }

  private routeWantsOverlay(route: ActivatedRouteSnapshot): boolean {
    let current: ActivatedRouteSnapshot | null = route;
    while (current?.firstChild) {
      current = current.firstChild;
    }
    return !!current?.data['overlayHeader'];
  }

  private focusables(): HTMLElement[] {
    const drawer = this.drawer()?.nativeElement;
    return drawer ? Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
  }
}
