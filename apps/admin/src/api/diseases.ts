import type { DiseaseStage, DiseaseStatus } from '@nabd/shared';
import { apiFetch } from './client';

// Shape returned by the API (`GET /diseases/manage`) — a serialized Mongoose document
// (see docs/03: diseases). Stages restyle the SAME model; they are never separate models.
export interface Disease {
  _id: string;
  key: string;
  termKey: string;
  icd11?: { code?: string; uri?: string };
  modelKey: string;
  stages: DiseaseStage[];
  symptomTermKeys: string[];
  videoIds?: string[];
  quizId?: string;
  status: DiseaseStatus;
}

export interface DiseaseListParams {
  page?: number;
  limit?: number;
  modelKey?: string;
  status?: DiseaseStatus;
  q?: string;
}

export interface DiseaseList {
  items: Disease[];
  page: number;
  limit: number;
  total: number;
}

// `key` is only sent on create — the API rejects it on PATCH (docs/02, D-040).
export type DiseaseInput = Omit<Disease, '_id' | 'key'> & { key?: string };

function toQuery(params: DiseaseListParams): string {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(name, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function listDiseases(params: DiseaseListParams, token: string): Promise<DiseaseList> {
  return apiFetch<DiseaseList>(`/diseases/manage${toQuery(params)}`, { token });
}

export function createDisease(input: DiseaseInput, token: string): Promise<Disease> {
  return apiFetch<Disease>('/diseases', { method: 'POST', body: input, token });
}

export function updateDisease(key: string, input: DiseaseInput, token: string): Promise<Disease> {
  return apiFetch<Disease>(`/diseases/${key}`, { method: 'PATCH', body: input, token });
}
