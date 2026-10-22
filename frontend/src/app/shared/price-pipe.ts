import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

/** "35 €" for whole amounts, "99,50 €" otherwise, in the given locale. */
@Pipe({
  name: 'price',
  standalone: false,
})
export class PricePipe implements PipeTransform {
  transform(value: string | number | null | undefined, locale: string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const amount = Number(value);
    const digits = Number.isInteger(amount) ? '1.0-0' : '1.2-2';
    return `${formatNumber(amount, locale, digits)} €`;
  }
}
