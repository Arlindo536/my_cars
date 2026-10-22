import { inject, provideAppInitializer } from '@angular/core';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import sq from '../../public/i18n/sq.json';

/** Real Albanian translations for specs, without HTTP. */
export function provideTestTranslations() {
  return [
    provideTranslateService({ fallbackLang: 'sq', lang: 'sq' }),
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      translate.setTranslation('sq', sq);
      translate.use('sq');
    }),
  ];
}
