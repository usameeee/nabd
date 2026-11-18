import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LoginResult } from '../api/auth';

const STORAGE_KEY = 'nabd.admin.auth';

interface AuthContextValue {
  session: LoginResult | null;
  signIn: (result: LoginResult) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): LoginResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoginResult) : null;
  } catch {
    return null;
  }
}

// Holds the access token + user in memory, mirrored to localStorage so a reload
// keeps the admin signed in. Refresh tokens are not implemented yet (docs/02).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LoginResult | null>(readStoredSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signIn: (result) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        setSession(result);
      },
      signOut: () => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
