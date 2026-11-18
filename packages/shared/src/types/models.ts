// Model + hotspot enums shared by API and admin (see docs/03_DATA_MODEL.md → models3d / hotspots).
export const MODEL_SYSTEMS = [
  'cardiovascular',
  'respiratory',
  'nervous',
  'digestive',
  'urinary',
  'endocrine',
  'reproductive',
  'musculoskeletal',
  'other',
] as const;
export type ModelSystem = (typeof MODEL_SYSTEMS)[number];

// The anatomical layers a model can expose (docs/03). Only the layers the file actually carries
// meshes for get listed, so the viewer's chip row (T-035) follows the data.
export const MODEL_LAYERS = ['muscles', 'vessels', 'skeleton', 'nerves'] as const;
export type ModelLayerKey = (typeof MODEL_LAYERS)[number];

export const MODEL_STATUSES = ['draft', 'verified'] as const;
export type ModelStatus = (typeof MODEL_STATUSES)[number];

// One GLB file: where it lives plus its weight and complexity (docs/03 → versions). Model files
// are referenced by URL — the API is JSON-only (docs/02) — not uploaded as binary.
export interface ModelVersion {
  url: string;
  sizeBytes: number;
  polyCount: number;
}

// A named group of mesh nodes inside the GLB (docs/03 → layers).
export interface ModelLayerDef {
  key: ModelLayerKey;
  meshNames: string[];
}
