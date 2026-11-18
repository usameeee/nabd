import { translations, type DiseaseStatus, type Locale, type ModelLayerKey, type ModelStatus, type TermStatus } from '@nabd/shared';

// Admin UI language. English is the neutral team language for now; strings still
// come from the shared i18n keys (never hardcoded) so a switcher can be added later.
const ADMIN_LOCALE: Locale = 'en';

const resources = translations[ADMIN_LOCALE] ?? translations.en;

export const admin = resources.admin;
export const brand = { wordmark: resources.app.wordmark, latin: resources.app.latinWordmark };

// Localized label for a term `status` (used by the table pills and the form select).
export function statusLabel(status: TermStatus): string {
  if (status === 'draft') return admin.terms.statusDraft;
  if (status === 'needs_review') return admin.terms.statusNeedsReview;
  return admin.terms.statusVerified;
}

// Localized label for a 3D layer key — the same strings the viewer's layer chips use.
export function layerLabel(layer: ModelLayerKey): string {
  return resources.viewer.layers[layer];
}

// Localized label for a model `status` (draft / verified).
export function modelStatusLabel(status: ModelStatus): string {
  return status === 'verified' ? admin.models.statusVerified : admin.models.statusDraft;
}

// Localized label for a disease `status` (draft / needs_review / verified).
export function diseaseStatusLabel(status: DiseaseStatus): string {
  if (status === 'draft') return admin.diseases.statusDraft;
  if (status === 'needs_review') return admin.diseases.statusNeedsReview;
  return admin.diseases.statusVerified;
}

