import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { themes, type ThemeColors, type ThemeName } from '@nabd/shared';

interface ThemeContextValue {
  name: ThemeName;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Colors come from the shared design tokens only (docs/01) — never hardcode them.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<ThemeName | null>(null);

  const name: ThemeName = override ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const colors = themes[name];

  const setTheme = useCallback((next: ThemeName) => setOverride(next), []);

  const value = useMemo(() => ({ name, colors, setTheme }), [name, colors, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
