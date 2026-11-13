import { Component, NgModule, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiModule } from './ui-module';

@Component({
  selector: 'app-count-host',
  standalone: false,
  template: '<span [appCountUp]="value()"></span>',
})
class CountHost {
  value = signal(18);
}

// The compiler needs the host in a module that imports UiModule
@NgModule({ declarations: [CountHost], imports: [UiModule] })
class HostModule {}

describe('CountUp', () => {
  it('shows the first value at once and ends on the new value', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] });
    await TestBed.configureTestingModule({ imports: [HostModule] }).compileComponents();
    const fixture = TestBed.createComponent(CountHost);
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.textContent).toBe('18');

    fixture.componentInstance.value.set(2);
    fixture.detectChanges();
    vi.advanceTimersByTime(250);
    const mid = Number(span.textContent);
    expect(mid).toBeLessThan(18);
    expect(mid).toBeGreaterThan(2);
    vi.advanceTimersByTime(400);
    expect(span.textContent).toBe('2');
    vi.useRealTimers();
  });
});
