import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import vi from './langs/vi.json';
import en from './langs/en.json';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: {
        translation: en,
      },
      vi: {
        translation: vi,
      },
    },
    lng: 'vi',
    debug: true,
    interpolation: {
      formatSeparator: ',',
      escapeValue: false, // react already safes from xss
    },
    react: {
      wait: true,
    },
  });

export default i18n;
