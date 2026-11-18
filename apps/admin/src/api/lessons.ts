import type { LessonStatus, LessonStep, LocalizedText } from '@nabd/shared';
import { apiFetch } from './client';

// Shape returned by the API (`GET /lessons/manage`) — a serialized Mongoose document
// (see docs/03: lessons). Titles are authored text; steps reference other content by key/id.
export interface Lesson {
  _id: string;
  key: string;
  title: LocalizedText;
  unit: string;
  order: number;
  faculty?: string;
  year?: number;
  steps: LessonStep[];
  termKeys: string[];
  status: LessonStatus;
}

export interface LessonListParams {
  page?: number;
  limit?: number;
  unit?: string;
  status?: LessonStatus;
  q?: string;
}

export interface LessonList {
  items: Lesson[];
  page: number;
  limit: number;
  total: number;
}

// `key` is only sent on create — the API rejects it on PATCH (docs/02, D-042).
export type LessonInput = Omit<Lesson, '_id' | 'key'> & { key?: string };

function toQuery(params: LessonListParams): string {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(name, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function listLessons(params: LessonListParams, token: string): Promise<LessonList> {
  return apiFetch<LessonList>(`/lessons/manage${toQuery(params)}`, { token });
}

export function createLesson(input: LessonInput, token: string): Promise<Lesson> {
  return apiFetch<Lesson>('/lessons', { method: 'POST', body: input, token });
}

export function updateLesson(key: string, input: LessonInput, token: string): Promise<Lesson> {
  return apiFetch<Lesson>(`/lessons/${key}`, { method: 'PATCH', body: input, token });
}
