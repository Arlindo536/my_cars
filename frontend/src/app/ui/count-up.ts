import { Directive, ElementRef, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { prefersReducedMotion } from '../motion';

// Counts the element's text from the previous value to the new one (short, ease-out).
// Purely visual: pair it with an aria-live text that states the final value, and mark this one aria-hidden.
@Directive({
  selector: '[appCountUp]',
  standalone: false,
})
export class CountUp implements OnChanges, OnDestroy {
  @Input({ required: true }) appCountUp!: number;
  @Input() countUpMs = 500;
  // Text for a value (e.g. a price); intermediate frames get whole numbers, the last one the exact value
  @Input() countUpFormat: (value: number) => string = String;
  // Start value for the very first number (e.g. 0 for dashboard counters); null shows it at once
  @Input() countUpFrom: number | null = null;

  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private shown: number | null = null;
  private frame = 0;

  ngOnChanges() {
    cancelAnimationFrame(this.frame);
    const from = this.shown ?? this.countUpFrom;
    const to = this.appCountUp;
    if (from === null || from === to || prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') {
      this.render(to);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / this.countUpMs);
      const eased = 1 - Math.pow(1 - t, 3);
      this.render(t < 1 ? Math.round(from + (to - from) * eased) : to);
      if (t < 1) {
        this.frame = requestAnimationFrame(step);
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.frame);
  }

  private render(value: number) {
    this.shown = value;
    this.el.textContent = this.countUpFormat(value);
  }
}
