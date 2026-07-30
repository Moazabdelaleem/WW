import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEY, translations, dynamicTranslations } from '../data/i18nData';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key, vars = {}) => {
    const dict = translations[lang] || translations.en;
    let str = dict[key] ?? translations.en[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  };

  const tr = (val) => {
    if (!val) return '';

    // Handle bilingual objects: { en: "Dining Table", ar: "طاولة طعام" }
    if (typeof val === 'object' && val !== null) {
      return val[lang] || val['ar'] || val['en'] || '';
    }

    const str = String(val).trim();

    // Handle JSON strings representing bilingual objects
    if (str.startsWith('{') && str.endsWith('}')) {
      try {
        const parsed = JSON.parse(str);
        if (parsed && typeof parsed === 'object') {
          return parsed[lang] || parsed['ar'] || parsed['en'] || str;
        }
      } catch (e) {}
    }

    if (lang === 'ar') {
      if (dynamicTranslations.ar[str]) return dynamicTranslations.ar[str];
      if (translations.ar[str]) return translations.ar[str];
    }

    return str;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t, tr, isAr: lang === 'ar' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
