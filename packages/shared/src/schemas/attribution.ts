import { z } from 'zod';
import { ATTRIBUTION_KINDS } from '../types/attributions';

// The page is a list endpoint, so it pages like every other list (AGENTS.md) and can be narrowed to
// one kind (models / terms / external media).
export const attributionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  kind: z.enum(ATTRIBUTION_KINDS).optional(),
});

export type AttributionListQuery = z.infer<typeof attributionListQuerySchema>;
