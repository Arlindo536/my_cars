import { TestBed } from '@angular/core/testing';

import { Theme } from './theme';

describe('Theme', () => {
  beforeEach(() => {
    localStorage.removeItem('theme');
    TestBed.configureTestingModule({});
  });

  it('follows the system by default', () => {
    const theme = TestBed.inject(Theme);
    expect(theme.pref()).toBe('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe(theme.resolved());
  });

  it('applies and remembers an explicit choice', () => {
    const theme = TestBed.inject(Theme);
    theme.set('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('forgets the choice when switching back to system', () => {
    localStorage.setItem('theme', 'light');
    const theme = TestBed.inject(Theme);
    expect(theme.pref()).toBe('light');
    theme.set('system');
    expect(localStorage.getItem('theme')).toBeNull();
  });
});
