import type { DiseaseStage } from '@nabd/shared';

// Heart diseases for the viewer's "diseases" tab (T-041). Shape mirrors the `diseases` collection
// in docs/03_DATA_MODEL.md: { key, termKey, icd11?, modelKey, stages[], symptomTermKeys, quizId? }.
// Term text is local until the terms API can serve it (T-013), like HEART_TERMS in hotspots.ts.
export interface DiseaseTerm {
  ar: string;
  fr: string;
  en: string;
}

export interface ViewerDisease {
  key: string;
  termKey: string;
  /** The disease name in all three languages (from `terms`, resolved at read time — docs/03). */
  term: DiseaseTerm;
  icd11?: { code?: string; uri?: string };
  modelKey: string;
  /** Stage recipes applied, in order, to the SAME model — never one model per stage (docs/03). */
  stages: DiseaseStage[];
  /** Symptom labels in all three languages (from `symptomTermKeys`, resolved at read time). */
  symptoms: DiseaseTerm[];
  quizId?: string;
  videoId?: string;
}

// Local term text for stage labels + symptoms. Keys are the `labelTermKey`/`symptomTermKeys` values,
// so swapping in the real terms API is a drop-in change (same as hotspots.ts). The fixture below
// references the constants directly (not the map) so it stays typed under `noUncheckedIndexedAccess`.
const MYOCARDIAL_INFARCTION: DiseaseTerm = {
  ar: 'احتشاء عضلة القلب',
  fr: 'Infarctus du myocarde',
  en: 'Myocardial infarction',
};
const STAGE_HEALTHY: DiseaseTerm = { ar: 'سليم', fr: 'Sain', en: 'Healthy' };
const STAGE_NARROWING: DiseaseTerm = { ar: 'التضيّق', fr: 'Rétrécissement', en: 'Narrowing' };
const STAGE_BLOCKAGE: DiseaseTerm = { ar: 'الانسداد', fr: 'Occlusion', en: 'Blockage' };
const STAGE_INFARCT: DiseaseTerm = { ar: 'احتشاء', fr: 'Infarctus', en: 'Infarct' };
const SYMPTOM_CHEST_PAIN: DiseaseTerm = {
  ar: 'ألم الصدر',
  fr: 'Douleur thoracique',
  en: 'Chest pain',
};
const SYMPTOM_DYSPNEA: DiseaseTerm = {
  ar: 'ضيق التنفّس',
  fr: 'Dyspnée',
  en: 'Shortness of breath',
};
const SYMPTOM_SWEATING: DiseaseTerm = { ar: 'تعرّق', fr: 'Sueurs', en: 'Sweating' };

export const DISEASE_TERMS: Record<string, DiseaseTerm> = {
  myocardial_infarction: MYOCARDIAL_INFARCTION,
  stage_healthy: STAGE_HEALTHY,
  stage_narrowing: STAGE_NARROWING,
  stage_blockage: STAGE_BLOCKAGE,
  stage_infarct: STAGE_INFARCT,
  symptom_chest_pain: SYMPTOM_CHEST_PAIN,
  symptom_dyspnea: SYMPTOM_DYSPNEA,
  symptom_sweating: SYMPTOM_SWEATING,
};

// The HRA heart is an organ model (chambers/valves, no coronary vessels), so the stage visual
// works by tinting the affected chamber meshes — the myocardium the infarct damages (left
// ventricle + septum). `materialOverrides` uses the viewer's own convention: color / opacity /
// emissive / emissiveIntensity (see resolveStage). `vesselNarrowing` is stored for a future
// vessel model but has no geometry to act on here (docs/03).
export const HEART_DISEASES: ViewerDisease[] = [
  {
    key: 'myocardial_infarction',
    termKey: 'myocardial_infarction',
    term: MYOCARDIAL_INFARCTION,
    icd11: { code: 'BA41' },
    modelKey: 'heart',
    stages: [
      {
        key: 'healthy',
        labelTermKey: 'stage_healthy',
        visual: {},
      },
      {
        key: 'narrowing',
        labelTermKey: 'stage_narrowing',
        visual: {
          highlightMeshes: ['VH_M_heart_left_ventricle'],
          materialOverrides: { color: '#C8553D', opacity: 0.92 },
          vesselNarrowing: 0.35,
        },
      },
      {
        key: 'blockage',
        labelTermKey: 'stage_blockage',
        visual: {
          highlightMeshes: ['VH_M_heart_left_ventricle', 'VH_M_interventricular_septum'],
          materialOverrides: { color: '#9E3B27', opacity: 0.85, emissive: '#2A0A04' },
          vesselNarrowing: 0.7,
        },
      },
      {
        key: 'infarct',
        labelTermKey: 'stage_infarct',
        visual: {
          highlightMeshes: ['VH_M_heart_left_ventricle', 'VH_M_interventricular_septum'],
          materialOverrides: {
            color: '#5A1F14',
            opacity: 0.95,
            emissive: '#E3A64A',
            emissiveIntensity: 0.35,
          },
          vesselNarrowing: 1,
        },
      },
    ],
    symptoms: [SYMPTOM_CHEST_PAIN, SYMPTOM_DYSPNEA, SYMPTOM_SWEATING],
    quizId: 'mi_basics',
    videoId: 'mi_animation',
  },
];

/** The material fields the viewer understands inside a stage's `materialOverrides`. */
export interface StageMaterial {
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
}

export interface ResolvedStage {
  /** GLB mesh names the stage tints; empty = the whole model keeps its base look. */
  meshes: string[];
  material: StageMaterial;
}

// Reads the viewer's material convention out of a stage's free-form `materialOverrides`
// (docs/03 keeps it a loose object so shared types don't leak Three.js specifics — D-040).
export function resolveStage(stage: DiseaseStage | undefined): ResolvedStage {
  const visual = stage?.visual;
  const overrides = visual?.materialOverrides ?? {};
  const text = (key: string): string | undefined => {
    const value = overrides[key];
    return typeof value === 'string' ? value : undefined;
  };
  const number = (key: string): number | undefined => {
    const value = overrides[key];
    return typeof value === 'number' ? value : undefined;
  };
  return {
    meshes: visual?.highlightMeshes ?? [],
    material: {
      color: text('color'),
      emissive: text('emissive'),
      emissiveIntensity: number('emissiveIntensity'),
      opacity: number('opacity'),
    },
  };
}
