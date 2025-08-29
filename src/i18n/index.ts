import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en/translation.json';
import zh from '../locales/zh/translation.json';
import es from '../locales/es/translation.json';
import fr from '../locales/fr/translation.json';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  },
  es: {
    translation: es
  },
  fr: {
    translation: fr
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // React already escapes by default
    },
    
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage']
    }
  });

// Region-based language override for mainland China
const overrideLanguageForRegion = () => {
  const userLanguage = navigator.language;
  const cachedLanguage = localStorage.getItem('i18nextLng');
  
  // Only override if no cached language preference exists
  if (!cachedLanguage) {
    // Check if user is in mainland China
    if (userLanguage === 'zh-CN' || userLanguage.startsWith('zh-')) {
      console.log('Detected Chinese region, switching to Chinese language');
      i18n.changeLanguage('zh');
    }
  } else {
    console.log('Using cached language preference:', cachedLanguage);
  }
};

// Apply region-based override
overrideLanguageForRegion();

export default i18n;