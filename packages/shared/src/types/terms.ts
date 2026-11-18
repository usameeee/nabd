// Term enums shared by API, admin and mobile (see docs/03_DATA_MODEL.md → terms).
export const TERM_CATEGORIES = [
  'anatomy',
  'disease',
  'symptom',
  'procedure',
  'drug',
  'other',
] as const;
export type TermCategory = (typeof TERM_CATEGORIES)[number];

export const TERM_SOURCES = ['TA2', 'ICD11', 'OPENSTAX', 'MANUAL', 'OTHER'] as const;
export type TermSource = (typeof TERM_SOURCES)[number];

export const TERM_STATUSES = ['draft', 'needs_review', 'verified'] as const;
export type TermStatus = (typeof TERM_STATUSES)[number];

// Counts for the admin dashboard stat cards (one query instead of three list calls).
export interface TermStats {
  total: number;
  drafts: number;
  needsReview: number;
  verified: number;
}
