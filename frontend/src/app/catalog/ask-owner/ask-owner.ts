import { Component, Input, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAX_MESSAGE_LENGTH, Messages } from '../../messages/messages';
import { Language } from '../../language';
import { Notification } from '../../notification';
import { CatalogCar } from '../../shared/car-labels';

@Component({
  selector: 'app-ask-owner',
  standalone: false,
  templateUrl: './ask-owner.html',
  styleUrl: './ask-owner.css'
})
export class AskOwner {
  @Input({ required: true }) car!: CatalogCar;

  private messages = inject(Messages);
  private router = inject(Router);
  private language = inject(Language);
  private notification = inject(Notification);

  readonly maxLength = MAX_MESSAGE_LENGTH;
  readonly sending = signal(false);
  readonly body = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(MAX_MESSAGE_LENGTH)] });

  get role(): string | null {
    return localStorage.getItem('role');
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  login() {
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/catalog/${this.car.id}` } });
  }

  send() {
    const text = this.body.value.trim();
    if (!text || this.body.invalid || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.messages.startConversation(this.car.id, text).subscribe({
      next: conversation => {
        this.sending.set(false);
        this.notification.success(this.language.t('messages.sent'));
        this.router.navigate(['/messages', conversation.id]);
      },
      error: err => {
        this.sending.set(false);
        this.notification.error(this.language.t(err.status === 429 ? 'messages.tooFast' : 'messages.sendFailed'));
      }
    });
  }
}
