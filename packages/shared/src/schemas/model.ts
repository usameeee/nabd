import { z } from 'zod';
import { MODEL_LAYERS, MODEL_STATUSES, MODEL_SYSTEMS } from '../types/models';

// Shared snake_case id shape, reused for `key` and `titleTermKey`.
const id = z.string().regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, 'must be snake_case (e.g. heart)');

const version = z.object({
  url: z.string().url(),
  sizeBytes: z.number().int().min(0),
  polyCount: z.number().int().min(0),
});

const layer = z.object({
  key: z.enum(MODEL_LAYERS),
  meshNames: z.array(z.string().min(1)),
});

export const createModelSchema = z.object({
  key: id,
  titleTermKey: id,
  system: z.enum(MODEL_SYSTEMS),
  versions: z.object({ light: version, detailed: version.optional() }),
  layers: z.array(layer).default([]),
  license: z.string().min(1),
  attribution: z.string().min(1),
  sourceUrl: z.string().url(),
  status: z.enum(MODEL_STATUSES).optional(),
});

// A patch may change any field except `key`; unknown fields (e.g. a stray `key`) are rejected.
export const updateModelSchema = createModelSchema.partial().omit({ key: true }).strict();

export const modelListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  system: z.enum(MODEL_SYSTEMS).optional(),
  status: z.enum(MODEL_STATUSES).optional(),
  q: z.string().min(1).max(100).optional(),
});

export type CreateModelInput = z.infer<typeof createModelSchema>;
export type UpdateModelInput = z.infer<typeof updateModelSchema>;
export type ModelListQuery = z.infer<typeof modelListQuerySchema>;
