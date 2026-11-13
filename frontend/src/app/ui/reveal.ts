import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { prefersReducedMotion } from '../motion';

// Fades content in when it scrolls into view. Content already on screen at load (and the LCP element)
// is never hidden, and nothing is hidden without IntersectionObserver or with reduced motion.
// Optional stagger index: <li [appReveal]="i">.
@Directive({
  selector: '[appReveal]',
  standalone: false,
})
export class Reveal implements AfterViewInit, OnDestroy {
  @Input() appReveal: number | '' = '';

  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      return;
    }
    if (this.el.getBoundingClientRect().top < window.innerHeight) {
      return;
    }
    if (this.appReveal !== '') {
      this.el.style.setProperty('--i', String(this.appReveal));
    }
    this.el.classList.add('reveal');
    this.observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          this.el.classList.add('is-revealed');
          this.observer?.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(this.el);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
