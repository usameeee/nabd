// Standard API envelope used by every endpoint (see docs/02).
export interface ApiError {
  code: string;
  message: string;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
