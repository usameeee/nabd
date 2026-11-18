// Disease enums + shapes shared by API and admin (see docs/03_DATA_MODEL.md → diseases).
export const DISEASE_STATUSES = ['draft', 'needs_review', 'verified'] as const;
export type DiseaseStatus = (typeof DISEASE_STATUSES)[number];

// Free-form Three.js material overrides applied to the model for one stage (docs/03 → stages[].visual).
export type MaterialOverrides = Record<string, unknown>;

// How a stage changes the model's look. Stages restyle the SAME model — never one model per stage (docs/03).
export interface DiseaseVisual {
  materialOverrides?: MaterialOverrides;
  highlightMeshes?: string[];
  /** 0 = normal lumen, 1 = fully occluded (the viewer eases this on the slider — T-041). */
  vesselNarrowing?: number;
}

// One disease stage, e.g. healthy → narrowing → blockage → infarct (docs/03).
export interface DiseaseStage {
  key: string;
  labelTermKey?: string;
  visual: DiseaseVisual;
}

// ICD-11 identity for the disease (docs/03). Codes/URIs come from WHO — never invented (docs/04).
export interface DiseaseIcd11 {
  code?: string;
  uri?: string;
}
