// Pure mapping from ICD-11 entities to `terms` drafts (task T-022). No network, no DB.
// The WHO text is copied verbatim — CC BY-ND 3.0 IGO forbids rewriting (docs/04, docs/03).

import { createTermSchema, type CreateTermInput } from '@nabd/shared';
import { toEntityUri, type EntityTexts } from './client';

export const ICD11_LICENSE = 'CC BY-ND 3.0 IGO';
export const ICD11_ATTRIBUTION = 'World Health Organization — ICD-11 (CC BY-ND 3.0 IGO)';

// The "heart-related only" scope of T-022: English queries sent to the ICD-11 search API.
// Hits are de-duplicated by entity, so overlap between queries is harmless.
// Widen the scope by extending this list — no other code change is needed.
export const HEART_QUERIES = [
  'myocardial infarction',
  'heart failure',
  'angina pectoris',
  'hypertensive heart disease',
  'cardiac arrhythmia',
  'atrial fibrillation',
  'cardiac arrest',
  'cardiomyopathy',
  'myocarditis',
  'pericarditis',
  'endocarditis',
  'heart valve disease',
  'rheumatic heart disease',
  'pulmonary heart disease',
  'congenital malformation of the heart',
  'coronary artery disease',
  'heart block',
] as const;

// English title → `key` (docs/03: snake_case, e.g. "left_ventricle").
// Only the identifier is derived here; the title itself is never altered.
export function keyFromTitle(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export interface TermDraft {
  key: string;
  sourceRef: string;
  input: CreateTermInput;
}

// One ICD-11 entity → one `terms` document, always as `needs_review` (a doctor_reviewer
// publishes it later, AGENTS.md). Returns null when the entity cannot become a valid term:
// docs/03 requires ar + fr + en, and ICD-11 does not localize every entity into all three.
export function buildTermDraft(id: string, texts: EntityTexts): TermDraft | null {
  const { ar, fr, en } = texts.titles;
  if (ar === undefined || fr === undefined || en === undefined) {
    return null;
  }

  const key = keyFromTitle(en);
  if (key === '') {
    return null;
  }

  // ICD-11 definitions are optional and often missing → only store what the API returned.
  const definition: { ar?: string; fr?: string; en?: string } = {};
  if (texts.definitions.ar !== undefined) definition.ar = texts.definitions.ar;
  if (texts.definitions.fr !== undefined) definition.fr = texts.definitions.fr;
  if (texts.definitions.en !== undefined) definition.en = texts.definitions.en;

  const sourceRef = toEntityUri(id);
  const parsed = createTermSchema.safeParse({
    key,
    ar,
    fr,
    en,
    category: 'disease',
    source: 'ICD11',
    sourceRef,
    license: ICD11_LICENSE,
    attribution: ICD11_ATTRIBUTION,
    status: 'needs_review',
    ...(Object.keys(definition).length > 0 ? { definition } : {}),
  });
  if (!parsed.success) {
    return null;
  }

  return { key, sourceRef, input: parsed.data };
}
