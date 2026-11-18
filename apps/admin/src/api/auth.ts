import type { Locale, Role } from '@nabd/shared';
import { apiFetch } from './client';

// Mirrors the public user returned by the auth endpoints (apps/api auth.controller).
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  language: Locale;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export function login(email: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
