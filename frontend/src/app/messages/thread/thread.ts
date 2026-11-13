import { Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, catchError, filter, switchMap, timer } from 'rxjs';
import { ConversationItem, MAX_MESSAGE_LENGTH, MessageItem, Messages } from '../messages';
import { Language } from '../../language';
import { Notification } from '../../notification';
import { scrollBehavior } from '../../motion';

const POLL_MS = 5000;
// Messages from the same sender within this gap form one group (one timestamp, joined bubbles)
const GROUP_GAP_MS = 5 * 60 * 1000;
// "At the bottom" tolerance when deciding whether to follow new messages
const NEAR_BOTTOM_PX = 80;

export type ThreadEntry =
  | { kind: 'day'; key: string; date: Date; relative: 'today' | 'yesterday' | null }
  | { kind: 'message'; key: string; message: MessageItem; first: boolean; last: boolean; fresh: boolean };

@Component({
  selector: 'app-thread',
  standalone: false,
  templateUrl: './thread.html',
  styleUrl: './thread.css'
})
export class Thread implements OnInit {
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  private messages = inject(Messages);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private notification = inject(Notification);
  readonly language = inject(Language);

  readonly maxLength = MAX_MESSAGE_LENGTH;
  readonly isAdmin = localStorage.getItem('role') === 'admin';
  readonly conversation = signal<ConversationItem | null>(null);
  readonly items = signal<MessageItem[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly failed = signal(false);
  readonly sending = signal(false);
  readonly body = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(MAX_MESSAGE_LENGTH)] });

  // Messages that arrived after the first load (they animate in) and how many are below the fold
  private readonly freshIds = signal<Set<number>>(new Set());
  readonly unseen = signal(0);

  // Day separators + sender groups, derived from the flat message list
  readonly entries = computed<ThreadEntry[]>(() => {
    const list = this.items();
    const fresh = this.freshIds();
    const entries: ThreadEntry[] = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      const prev = list[i - 1];
      const next = list[i + 1];
      const at = new Date(m.created_at);
      const day = startOfDay(at);
      if (!prev || startOfDay(new Date(prev.created_at)).getTime() !== day.getTime()) {
        const diffDays = Math.round((today.getTime() - day.getTime()) / 86400000);
        entries.push({ kind: 'day', key: 'd' + day.getTime(), date: day, relative: diffDays === 0 ? 'today' : diffDays === 1 ? 'yesterday' : null });
      }
      entries.push({
        kind: 'message',
        key: 'm' + m.id,
        message: m,
        first: !prev || !sameGroup(prev, m),
        last: !next || !sameGroup(m, next),
        fresh: fresh.has(m.id),
      });
    }
    return entries;
  });

  private conversationId = 0;

  ngOnInit() {
    this.conversationId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();

    // Poll for new messages while the tab is visible (no WebSockets by design)
    timer(POLL_MS, POLL_MS)
      .pipe(
        filter(() => document.visibilityState === 'visible' && !!this.conversation()),
        switchMap(() => this.messages.getThread(this.conversationId, this.lastId()).pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(data => {
        if (data.messages.length) {
          this.append(data.messages);
          this.refreshUnread();
        }
      });
  }

  load() {
    this.loading.set(true);
    this.failed.set(false);
    this.messages.getThread(this.conversationId).subscribe({
      next: data => {
        this.conversation.set(data.conversation);
        this.items.set(data.messages);
        this.loading.set(false);
        this.scrollToBottom();
        this.refreshUnread();
      },
      error: err => {
        this.notFound.set(err.status === 404);
        this.failed.set(err.status !== 404);
        this.loading.set(false);
      }
    });
  }

  send() {
    const text = this.body.value.trim();
    if (!text || this.body.invalid || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.messages.sendMessage(this.conversationId, text).subscribe({
      next: message => {
        this.append([message]);
        this.body.reset();
        this.sending.set(false);
      },
      error: err => {
        this.sending.set(false);
        this.notification.error(this.language.t(err.status === 429 ? 'messages.tooFast' : 'messages.sendFailed'));
      }
    });
  }

  // Enter sends, Shift+Enter makes a new line
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    }
  }

  private append(newMessages: MessageItem[]) {
    // A poll can return a message we already added after sending it
    const known = new Set(this.items().map(m => m.id));
    const fresh = newMessages.filter(m => !known.has(m.id));
    if (!fresh.length) {
      return;
    }
    // Follow the conversation if the reader is at the bottom or just sent something; otherwise offer a button
    const follow = this.isNearBottom() || fresh.some(m => m.mine);
    this.freshIds.update(ids => new Set([...ids, ...fresh.map(m => m.id)]));
    this.items.update(list => [...list, ...fresh]);
    if (follow) {
      this.scrollToBottom(true);
    } else {
      this.unseen.update(n => n + fresh.length);
    }
  }

  onScroll() {
    if (this.unseen() && this.isNearBottom()) {
      this.unseen.set(0);
    }
  }

  showLatest() {
    this.unseen.set(0);
    this.scrollToBottom(true);
  }

  trackEntry(_: number, entry: ThreadEntry) {
    return entry.key;
  }

  private isNearBottom(): boolean {
    const el = this.scroller?.nativeElement;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  }

  private lastId(): number | undefined {
    const list = this.items();
    return list.length ? list[list.length - 1].id : undefined;
  }

  private refreshUnread() {
    this.messages.refreshUnread().pipe(catchError(() => EMPTY)).subscribe();
  }

  private scrollToBottom(smooth = false) {
    // After Angular has rendered the new messages
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      el?.scrollTo({ top: el.scrollHeight, behavior: smooth ? scrollBehavior() : 'auto' });
    });
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameGroup(a: MessageItem, b: MessageItem): boolean {
  return (
    a.mine === b.mine &&
    a.sender_role === b.sender_role &&
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime() < GROUP_GAP_MS &&
    startOfDay(new Date(a.created_at)).getTime() === startOfDay(new Date(b.created_at)).getTime()
  );
}
