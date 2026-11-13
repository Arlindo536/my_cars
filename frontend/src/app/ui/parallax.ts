import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { prefersReducedMotion } from '../motion';

// Soft parallax for decorative backgrounds: moves the element at `appParallax` × the scroll distance
// while its parent is on screen. Desktop with a fine pointer only; off with reduced motion.
@Directive({
  selector: '[appParallax]',
  standalone: false,
})
export class Parallax implements OnInit, OnDestroy {
  @Input() appParallax: number | '' = 0.25;

  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private queued = false;
  private readonly onScroll = () => {
    if (!this.queued) {
      this.queued = true;
      requestAnimationFrame(() => this.update());
    }
  };

  ngOnInit() {
    const wide = window.matchMedia?.('(min-width: 992px) and (pointer: fine)').matches;
    if (!wide || prefersReducedMotion()) {
      return;
    }
    // A plain listener (not a host binding), so scrolling never schedules change detection
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }

  private update() {
    this.queued = false;
    const y = window.scrollY;
    const height = this.el.parentElement?.offsetHeight ?? window.innerHeight;
    if (y > height) {
      return;
    }
    const factor = this.appParallax === '' ? 0.25 : this.appParallax;
    this.el.style.transform = `translate3d(0, ${(y * factor).toFixed(1)}px, 0)`;
  }
}
