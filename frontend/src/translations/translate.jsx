import React, { createContext, useState, useContext, useEffect } from 'react';
import en from './en.json';
import te from './te.json';
import hi from './hi.json';

const LanguageContext = createContext();

const translations = { en, te, hi };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('handloom_language') || 'en';
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('handloom_language', lang);
    }
  };

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let current = translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English translation if key is missing in Telugu/Hindi
        let englishFallback = en;
        for (const k of keys) {
          if (englishFallback && englishFallback[k] !== undefined) {
            englishFallback = englishFallback[k];
          } else {
            return keyPath; // return raw path if not found in fallback either
          }
        }
        return englishFallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
