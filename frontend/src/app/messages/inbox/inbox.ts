import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, filter, switchMap, timer } from 'rxjs';
import { ConversationItem, Messages } from '../messages';
import { Language } from '../../language';

const PAGE_SIZE = 20;
const POLL_MS = 15000;

@Component({
  selector: 'app-inbox',
  standalone: false,
  templateUrl: './inbox.html',
  styleUrl: './inbox.css'
})
export class Inbox implements OnInit {
  private messages = inject(Messages);
  private destroyRef = inject(DestroyRef);
  readonly language = inject(Language);

  readonly isAdmin = localStorage.getItem('role') === 'admin';
  readonly items = signal<ConversationItem[]>([]);
  readonly count = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.count() / PAGE_SIZE)));

  ngOnInit() {
    this.load();
    // Keep the list fresh while the tab is visible
    timer(POLL_MS, POLL_MS)
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        switchMap(() => this.messages.getConversations(this.page()).pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(data => {
        this.items.set(data.results);
        this.count.set(data.count);
      });
  }

  load() {
    this.loading.set(true);
    this.failed.set(false);
    this.messages.getConversations(this.page()).subscribe({
      next: data => {
        this.items.set(data.results);
        this.count.set(data.count);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number) {
    this.page.set(page);
    this.load();
  }
}
