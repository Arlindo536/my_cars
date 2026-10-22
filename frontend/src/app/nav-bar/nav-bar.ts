import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EMPTY, catchError, filter, switchMap, timer } from 'rxjs';
import { Messages } from '../messages/messages';

const UNREAD_POLL_MS = 30000;

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar implements OnInit {
  menuOpen = false;
  readonly messages = inject(Messages);
  private destroyRef = inject(DestroyRef);

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
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }

  // Close the mobile menu after a link or button inside it is used
  closeMenu(event: Event) {
    if ((event.target as HTMLElement).closest('a, button')) {
      this.menuOpen = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.messages.unread.set(0);
    this.router.navigate(['/auth/login']);
  }
}
