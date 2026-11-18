import type { TermCategory, TermSource, TermStats, TermStatus } from '@nabd/shared';
import { apiFetch } from './client';

// Shape returned by the API (`GET /terms/manage`) — a serialized Mongoose document.
export interface Term {
  _id: string;
  key: string;
  ar: string;
  fr: string;
  en: string;
  latin?: string;
  category: TermCategory;
  source: TermSource;
  sourceRef?: string;
  license: string;
  attribution?: string;
  status: TermStatus;
}

export interface TermListParams {
  page?: number;
  limit?: number;
  category?: TermCategory;
  status?: TermStatus;
  q?: string;
}

export interface TermList {
  items: Term[];
  page: number;
  limit: number;
  total: number;
}

// `key` is only sent on create — the API rejects it on PATCH (docs/02, D-019).
export type TermInput = Omit<Term, '_id' | 'key' | 'status'> & {
  key?: string;
  status?: TermStatus;
};

function toQuery(params: TermListParams): string {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(name, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function listTerms(params: TermListParams, token: string): Promise<TermList> {
  return apiFetch<TermList>(`/terms/manage${toQuery(params)}`, { token });
}

export function getTermStats(token: string): Promise<TermStats> {
  return apiFetch<TermStats>('/terms/stats', { token });
}

export function createTerm(input: TermInput, token: string): Promise<Term> {
  return apiFetch<Term>('/terms', { method: 'POST', body: input, token });
}

export function updateTerm(key: string, input: TermInput, token: string): Promise<Term> {
  return apiFetch<Term>(`/terms/${key}`, { method: 'PATCH', body: input, token });
}
