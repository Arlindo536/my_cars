import { registerLocaleData } from '@angular/common';
import localeSq from '@angular/common/locales/sq';
import localeDe from '@angular/common/locales/de';
import { PricePipe } from './price-pipe';

registerLocaleData(localeSq, 'sq');
registerLocaleData(localeDe, 'de');

describe('PricePipe', () => {
  const pipe = new PricePipe();

  it('drops decimals for whole amounts and keeps two otherwise', () => {
    expect(pipe.transform('35.00', 'en-US')).toBe('35 €');
    expect(pipe.transform('99.50', 'en-US')).toBe('99.50 €');
    expect(pipe.transform('99.50', 'de')).toBe('99,50 €');
    expect(pipe.transform('1250.00', 'de')).toBe('1.250 €');
  });
});
