import type { ApiResponse } from '@nabd/shared';

// Base URL of the API. Set VITE_API_URL to override (see .env.example).
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

// Unwraps the shared `{ ok, data?, error? }` envelope (docs/02) or throws ApiError.
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.ok) {
    throw new ApiError(payload.error.code, payload.error.message);
  }
  return payload.data;
}
