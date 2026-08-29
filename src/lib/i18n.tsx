"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations } from "@/lib/translations";

export type Locale = "tr" | "en";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (typeof translations)["tr"];
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "hayzapp-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "tr" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "tr" ? "en" : "tr");
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: translations[locale],
    }),
    [locale, setLocale, toggleLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
