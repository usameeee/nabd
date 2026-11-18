import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, FALLBACK_LOCALES, translations } from '@nabd/shared';

// Resources are bundled in @nabd/shared, so no network/backend plugin is needed.
void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: translations.ar },
    fr: { translation: translations.fr },
    en: { translation: translations.en },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: FALLBACK_LOCALES,
  interpolation: { escapeValue: false },
});

export default i18n;
