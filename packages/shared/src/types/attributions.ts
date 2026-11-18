// "Sources & licenses" is a GENERATED view (docs/03 → attributions): nothing is stored. Each entry
// is derived at read time from the `license`/`attribution` fields of the content collections
// (`terms`, `models3d`) and of external media, so fixing a licence in one document updates the page.
export const ATTRIBUTION_KINDS = ['model', 'term', 'media'] as const;
export type AttributionKind = (typeof ATTRIBUTION_KINDS)[number];

export interface AttributionEntry {
  /** Stable id within its kind — a term key / model key / media id. */
  key: string;
  kind: AttributionKind;
  /** Human label for the credited item (a term's Arabic title, a model's key). */
  title: string;
  /** Licence name as registered, e.g. "CC BY 4.0" (docs/04 per-asset checklist). */
  license: string;
  /** Attribution text to display verbatim — never reworded (docs/04). */
  attribution: string;
  /** Where the asset came from, when known. */
  sourceUrl?: string;
}
