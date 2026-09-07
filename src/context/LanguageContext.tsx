'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  SUPPORTED_LANGUAGES,
  LanguageOption,
  translations,
  TranslationKey,
  t as translateFn,
} from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  supportedLanguages: LanguageOption[];
  t: (key: TranslationKey | string, fallback?: string) => string;
}

const defaultContext: LanguageContextType = {
  language: 'uz',
  setLanguage: () => {},
  supportedLanguages: SUPPORTED_LANGUAGES,
  t: (key, fallback) => translateFn(key, 'uz', fallback),
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('asron_lang') as Language;
        if (stored === 'uz' || stored === 'en' || stored === 'ru') {
          return stored;
        }
      } catch {
        // Safe fallback
      }
    }
    return 'uz';
  });

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('asron_lang', newLang);
        window.dispatchEvent(
          new CustomEvent('asron_language_changed', { detail: { language: newLang } })
        );
      } catch {
        // Safe fallback
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'asron_lang' &&
        e.newValue &&
        (e.newValue === 'uz' || e.newValue === 'en' || e.newValue === 'ru')
      ) {
        setLanguageState(e.newValue as Language);
      }
    };

    const handleCustom = (e: any) => {
      const customLang = e.detail?.language;
      if (customLang && (customLang === 'uz' || customLang === 'en' || customLang === 'ru')) {
        setLanguageState(customLang);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('asron_language_changed', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('asron_language_changed', handleCustom);
    };
  }, []);

  const t = useCallback(
    (key: TranslationKey | string, fallback?: string) => {
      return translateFn(key, language, fallback);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
