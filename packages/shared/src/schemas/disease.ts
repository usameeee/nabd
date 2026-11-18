import { z } from 'zod';
import { DISEASE_STATUSES } from '../types/diseases';

// Shared snake_case id shape, reused for `key` and every `*TermKey`/`modelKey` reference.
const id = z.string().regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, 'must be snake_case (e.g. myocardial_infarction)');

// Free-form Three.js material params (a JSON blob) — docs/03 → stages[].visual.materialOverrides.
const materialOverrides = z.record(z.string(), z.unknown());

const visual = z.object({
  materialOverrides: materialOverrides.optional(),
  highlightMeshes: z.array(z.string().min(1)).optional(),
  // 0 = normal lumen, 1 = fully occluded (docs/03 stage visuals).
  vesselNarrowing: z.number().min(0).max(1).optional(),
});

// A stage id is a plain snake_case token, e.g. healthy / narrowing / blockage / infarct (docs/03).
const stage = z.object({
  key: id,
  labelTermKey: id.optional(),
  visual: visual.default({}),
});

const icd11 = z.object({
  code: z.string().min(1).optional(),
  uri: z.string().url().optional(),
});

export const createDiseaseSchema = z.object({
  key: id,
  // Points at terms.key where category is "disease" — a disease never copies term text (docs/03).
  termKey: id,
  icd11: icd11.optional(),
  modelKey: id,
  stages: z.array(stage).default([]),
  symptomTermKeys: z.array(id).default([]),
  videoIds: z.array(z.string().min(1)).optional(),
  quizId: z.string().min(1).optional(),
  status: z.enum(DISEASE_STATUSES).optional(),
});

// A patch may change any field except `key`; unknown fields (e.g. a stray `key`) are rejected.
export const updateDiseaseSchema = createDiseaseSchema.partial().omit({ key: true }).strict();

export const diseaseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  modelKey: id.optional(),
  status: z.enum(DISEASE_STATUSES).optional(),
  q: z.string().min(1).max(100).optional(),
});

export type CreateDiseaseInput = z.infer<typeof createDiseaseSchema>;
export type UpdateDiseaseInput = z.infer<typeof updateDiseaseSchema>;
export type DiseaseListQuery = z.infer<typeof diseaseListQuerySchema>;
