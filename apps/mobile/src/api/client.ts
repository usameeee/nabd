// Minimal API client (T-050). Follows docs/02: base path `/api/v1`, JSON only, and every response is
// the `{ ok, data?, error? }` envelope. The base URL comes from `EXPO_PUBLIC_API_URL`; it is UNSET
// in this build (there is no hosted API yet — the T-013 Atlas blocker), so `isApiConfigured()` is
// false and offline-first callers fall back to the on-device cache + bundled fixtures instead of
// waiting on a request that cannot succeed.

/** Base URL of the API incl. the version prefix, e.g. `https://api.example.com/api/v1`. */
export const API_URL: string = process.env.EXPO_PUBLIC_API_URL ?? '';

/** Whether an API base URL is configured. When false, callers must not attempt a request. */
export function isApiConfigured(): boolean {
  return API_URL.length > 0;
}

export interface ApiError {
  code: string;
  message: string;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const DEFAULT_TIMEOUT_MS = 8000;

/** GETs `path` (relative to `API_URL`) and unwraps the `{ ok, data, error }` envelope. */
export async function apiGet<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  if (!isApiConfigured()) {
    return { ok: false, error: { code: 'NO_API', message: 'API is not configured' } };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    const body = (await response.json()) as { ok?: boolean; data?: T; error?: ApiError };
    if (!response.ok || body.ok !== true || body.data === undefined) {
      return {
        ok: false,
        error: body.error ?? { code: 'HTTP_ERROR', message: `HTTP ${response.status}` },
      };
    }
    return { ok: true, data: body.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'network error';
    return { ok: false, error: { code: 'NETWORK_ERROR', message } };
  } finally {
    clearTimeout(timer);
  }
}
