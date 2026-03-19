"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import en from "@/i18n/en.json";
import si from "@/i18n/si.json";

type Lang = "en" | "si";
type Translations = Record<string, string>;

const translations: Record<Lang, Translations> = { en, si };

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("Tap2Buy-lang") as Lang | null;
    if (saved && (saved === "en" || saved === "si")) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("Tap2Buy-lang", newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[lang][key] || key;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}
