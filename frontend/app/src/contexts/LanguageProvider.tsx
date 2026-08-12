import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../i18n/i18n"

type Language = "vi" | "en";

type TranslationKey = keyof typeof translations["en"];

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  translate: (vi: string, en: string) => string;
}


const defaultLanguageContext: LanguageContextType = {
  lang: "vi",
  setLang: () => undefined,
  t: key => translations.vi[key],
  translate: vi => vi,
}

const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "vi" || saved === "en") ? saved : "vi";
  });

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = (key: TranslationKey | string) => {
    if (key in translations[lang]) {
      return translations[lang][key as TranslationKey];
    }
    return key; // fallback
  };

  const translate = (vi: string, en: string) => lang === "vi" ? vi : en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext)
}
