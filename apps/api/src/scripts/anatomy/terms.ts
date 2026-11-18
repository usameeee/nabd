// Manual heart-anatomy term list (T-023). The CSV holds the text; the fixed
// metadata (category/source/license/status) lives here, next to the constants,
// so changing it is a one-line edit instead of 30 row edits (mirrors the ICD-11 script).

import { createTermSchema, type CreateTermInput } from '@nabd/shared';

export const ANATOMY_CATEGORY = 'anatomy' as const;
// Hand-curated list — NOT scraped from Terminologia Anatomica, whose redistribution
// licence docs/04 still marks NOT VERIFIED. See D-028.
export const ANATOMY_SOURCE = 'MANUAL' as const;
// The project owns this curation and there is no public licence file yet.
export const ANATOMY_LICENSE = 'PROPRIETARY';
// A doctor_reviewer verifies terms; nothing reaches students before that (AGENTS.md).
export const ANATOMY_STATUS = 'needs_review' as const;

// CSV columns: key, ar, fr, en, latin (latin optional). The schema stays the single
// validator (docs/03 requires ar + fr + en), so an incomplete row is rejected, not filled in.
export function buildTermInput(row: Record<string, string>): CreateTermInput | null {
  const parsed = createTermSchema.safeParse({
    key: row.key,
    ar: row.ar,
    fr: row.fr,
    en: row.en,
    ...(row.latin ? { latin: row.latin } : {}),
    category: ANATOMY_CATEGORY,
    source: ANATOMY_SOURCE,
    license: ANATOMY_LICENSE,
    status: ANATOMY_STATUS,
  });
  return parsed.success ? parsed.data : null;
}
