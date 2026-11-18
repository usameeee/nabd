import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { I18nManager } from 'react-native';
import { DEFAULT_LOCALE, LOCALES, isRtl, type Locale } from '@nabd/shared';
import i18n from './index';

const STORAGE_KEY = 'nabd.locale';

interface LocaleContextValue {
  locale: Locale;
  rtl: boolean;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function toLocale(value: string | null): Locale | null {
  return value && (LOCALES as readonly string[]).includes(value) ? (value as Locale) : null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Restore the saved language on start.
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      const saved = toLocale(stored);
      if (active && saved && saved !== DEFAULT_LOCALE) {
        setLocaleState(saved);
        void i18n.changeLanguage(saved);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    void i18n.changeLanguage(next);
    // Native direction flip needs an app restart; screens also set `direction`
    // from `rtl` so the layout updates immediately.
    I18nManager.forceRTL(isRtl(next));
    void AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ locale, rtl: isRtl(locale), setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
