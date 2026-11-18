import { z } from 'zod';
import { MODEL_LAYERS } from '../types/models';

const id = z.string().regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, 'must be snake_case');
const vec3 = z.tuple([z.number(), z.number(), z.number()]);

// Saved camera pose for a hotspot (docs/03 → hotspots). The viewer eases to it on select (T-033).
const camera = z.object({
  position: vec3,
  target: vec3,
  zoom: z.number().positive().optional(),
});

export const createHotspotSchema = z.object({
  modelKey: id,
  // Points at terms.key — a hotspot never copies term text (docs/03).
  termKey: id,
  meshName: z.string().min(1).optional(),
  position: vec3,
  layer: z.enum(MODEL_LAYERS).optional(),
  camera,
  order: z.number().int().min(1),
});

// A hotspot has no natural key — it is addressed by its Mongo id — so a patch may touch any field.
export const updateHotspotSchema = createHotspotSchema.partial().strict();

export const hotspotListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  modelKey: id.optional(),
  layer: z.enum(MODEL_LAYERS).optional(),
});

export type CreateHotspotInput = z.infer<typeof createHotspotSchema>;
export type UpdateHotspotInput = z.infer<typeof updateHotspotSchema>;
export type HotspotListQuery = z.infer<typeof hotspotListQuerySchema>;
