// Minimal i18n: en/sr dictionaries, dot-path t() with {var} interpolation, persisted choice.
// Wrapped at the root; consumed via useTranslation(). No i18next needed for two languages.
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "./en.json";
import sr from "./sr.json";

export type Language = "en" | "sr";

const RESOURCES = { en, sr } as const;
const STORAGE_KEY = "smena.language";
const DEFAULT_LANGUAGE: Language = "sr";

// Build the union of all leaf dot-paths from the English dictionary for type-safe keys.
type Paths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${Paths<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type TranslationKey = Paths<typeof en>;

type Vars = Record<string, string | number>;

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

// Walk a nested object by dot path; returns undefined if any segment is missing.
function resolve(dict: unknown, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>((acc, seg) => (acc as Record<string, unknown>)?.[seg], dict);
  return typeof value === "string" ? value : undefined;
}

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "en" || stored === "sr") setLanguageState(stored);
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    void AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Vars) => {
      const text =
        resolve(RESOURCES[language], key) ?? resolve(RESOURCES.en, key) ?? key;
      return interpolate(text, vars);
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
