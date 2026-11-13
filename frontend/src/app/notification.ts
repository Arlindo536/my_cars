import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

const DURATION = { success: 4000, error: 6000 };
const MAX_TOASTS = 4;

// Toasts shown by <app-toast-host> (bottom of the screen, stacked, auto-dismissed, announced via aria-live)
@Injectable({
  providedIn: 'root',
})
export class Notification {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  success(message: string) {
    this.show('success', message);
  }

  error(message: string) {
    this.show('error', message);
  }

  dismiss(id: number) {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  /** Hover/focus keeps a toast on screen; leaving restarts its timer */
  pause(id: number) {
    clearTimeout(this.timers.get(id));
  }

  resume(id: number) {
    const toast = this.toasts().find(t => t.id === id);
    if (toast) {
      this.schedule(toast);
    }
  }

  private show(kind: Toast['kind'], message: string) {
    const toast: Toast = { id: this.nextId++, kind, message };
    const list = [...this.toasts(), toast];
    // Oldest go first when too many stack up
    list.slice(0, Math.max(0, list.length - MAX_TOASTS)).forEach(t => this.dismiss(t.id));
    this.toasts.set(list.slice(-MAX_TOASTS));
    this.schedule(toast);
  }

  private schedule(toast: Toast) {
    clearTimeout(this.timers.get(toast.id));
    this.timers.set(toast.id, setTimeout(() => this.dismiss(toast.id), DURATION[toast.kind]));
  }
}
