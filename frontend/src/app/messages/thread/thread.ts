import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, catchError, filter, switchMap, timer } from 'rxjs';
import { ConversationItem, MAX_MESSAGE_LENGTH, MessageItem, Messages } from '../messages';
import { Language } from '../../language';
import { Notification } from '../../notification';

const POLL_MS = 5000;

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
    if (fresh.length) {
      this.items.update(list => [...list, ...fresh]);
      this.scrollToBottom();
    }
  }

  private lastId(): number | undefined {
    const list = this.items();
    return list.length ? list[list.length - 1].id : undefined;
  }

  private refreshUnread() {
    this.messages.refreshUnread().pipe(catchError(() => EMPTY)).subscribe();
  }

  private scrollToBottom() {
    // After Angular has rendered the new messages
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
