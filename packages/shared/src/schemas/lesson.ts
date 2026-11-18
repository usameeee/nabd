import { z } from 'zod';
import { LESSON_STATUSES, LESSON_STEP_TYPES } from '../types/lessons';

// Shared snake_case id shape, reused for `key` and every `*Key`/`*TermKeys` reference.
const id = z.string().regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, 'must be snake_case (e.g. heart_circulation)');

// Lesson titles are authored text (not term refs): Arabic required, FR/EN optional (docs/01).
const localizedText = z.object({
  ar: z.string().min(1),
  fr: z.string().min(1).optional(),
  en: z.string().min(1).optional(),
});

// What a step points at (docs/03). `hotspotIds` are hotspot `_id`s → plain strings.
const stepRef = z.object({
  modelKey: id.optional(),
  hotspotIds: z.array(z.string().min(1)).optional(),
  diseaseKey: id.optional(),
  videoId: z.string().min(1).optional(),
  caseId: z.string().min(1).optional(),
  quizId: z.string().min(1).optional(),
});

const step = z.object({
  type: z.enum(LESSON_STEP_TYPES),
  ref: stepRef.default({}),
  xp: z.number().int().min(0),
});

export const createLessonSchema = z.object({
  key: id,
  title: localizedText,
  // Free-text grouping, e.g. "cardiology" (docs/03 → unit).
  unit: z.string().min(1),
  order: z.number().int().min(0),
  faculty: z.string().min(1).optional(),
  year: z.number().int().optional(),
  steps: z.array(step).default([]),
  // Terms unlocked by finishing the lesson — references, never copied text (docs/03).
  termKeys: z.array(id).default([]),
  status: z.enum(LESSON_STATUSES).optional(),
});

// A patch may change any field except `key`; unknown fields (e.g. a stray `key`) are rejected.
export const updateLessonSchema = createLessonSchema.partial().omit({ key: true }).strict();

export const lessonListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unit: z.string().min(1).optional(),
  status: z.enum(LESSON_STATUSES).optional(),
  q: z.string().min(1).max(100).optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type LessonListQuery = z.infer<typeof lessonListQuerySchema>;
