import { z } from 'zod';
import { TERM_CATEGORIES, TERM_SOURCES, TERM_STATUSES } from '../types/terms';

const translation = z.string().min(1);
const optionalTranslation = z.string().min(1).optional();

export const createTermSchema = z.object({
  key: z
    .string()
    .regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, 'key must be snake_case (e.g. left_ventricle)'),
  ar: translation,
  fr: translation,
  en: translation,
  latin: optionalTranslation,
  definition: z
    .object({ ar: optionalTranslation, fr: optionalTranslation, en: optionalTranslation })
    .optional(),
  category: z.enum(TERM_CATEGORIES),
  source: z.enum(TERM_SOURCES),
  sourceRef: z.string().min(1).optional(),
  license: z.string().min(1),
  attribution: z.string().min(1).optional(),
  status: z.enum(TERM_STATUSES).optional(),
  audio: z
    .object({ ar: optionalTranslation, fr: optionalTranslation, en: optionalTranslation })
    .optional(),
});

// A patch may change any field except `key`; unknown fields (e.g. a stray `key`) are rejected.
export const updateTermSchema = createTermSchema.partial().omit({ key: true }).strict();

export const termListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.enum(TERM_CATEGORIES).optional(),
  status: z.enum(TERM_STATUSES).optional(),
  q: z.string().min(1).max(100).optional(),
});

export type CreateTermInput = z.infer<typeof createTermSchema>;
export type UpdateTermInput = z.infer<typeof updateTermSchema>;
export type TermListQuery = z.infer<typeof termListQuerySchema>;
