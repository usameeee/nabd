import type { TermSource } from '@nabd/shared';

// Heart hotspots for the anatomy viewer (T-033). Shape mirrors the `hotspots` collection in
// docs/03_DATA_MODEL.md: { modelKey, termKey, meshName, position, layer, order }.
// `position` is the mesh centre measured in the source model's own space (heart.glb, which
// shares its world geometry with heart.light.glb), so the rig can derive the camera angles and
// the anchor transform from it. The `camera` block is authored by the admin editor later (T-036).
export interface HotspotDef {
  modelKey: string;
  termKey: string;
  meshName: string;
  position: readonly [number, number, number];
  layer: string;
  order: number;
}

// Static term text until the API serves terms (T-013): keys match the `terms.key` values imported
// by apps/api/src/scripts/anatomy/heart-terms.csv, so swapping in real terms is a drop-in change.
export interface HotspotTerm {
  ar: string;
  fr: string;
  en: string;
  latin?: string;
  source: TermSource;
}

export const HEART_TERMS: Record<string, HotspotTerm> = {
  right_atrium: {
    ar: 'الأذين الأيمن',
    fr: 'atrium droit',
    en: 'right atrium',
    latin: 'Atrium dextrum',
    source: 'MANUAL',
  },
  left_atrium: {
    ar: 'الأذين الأيسر',
    fr: 'atrium gauche',
    en: 'left atrium',
    latin: 'Atrium sinistrum',
    source: 'MANUAL',
  },
  right_ventricle: {
    ar: 'البطين الأيمن',
    fr: 'ventricule droit',
    en: 'right ventricle',
    latin: 'Ventriculus dexter',
    source: 'MANUAL',
  },
  left_ventricle: {
    ar: 'البطين الأيسر',
    fr: 'ventricule gauche',
    en: 'left ventricle',
    latin: 'Ventriculus sinister',
    source: 'MANUAL',
  },
  interventricular_septum: {
    ar: 'الحاجز بين البطينين',
    fr: 'septum interventriculaire',
    en: 'interventricular septum',
    latin: 'Septum interventriculare',
    source: 'MANUAL',
  },
};

// The model ships these anatomy meshes only (no vessels or skeleton), so every hotspot is on the
// muscle layer. Positions are the mesh centres read off the GLB.
export const HEART_HOTSPOTS: HotspotDef[] = [
  {
    modelKey: 'heart',
    termKey: 'right_atrium',
    meshName: 'VH_M_right_cardiac_atrium',
    position: [-0.0174, 0.4809, 0.0344],
    layer: 'muscles',
    order: 1,
  },
  {
    modelKey: 'heart',
    termKey: 'left_atrium',
    meshName: 'VH_M_left_cardiac_atrium',
    position: [0.0044, 0.4926, 0.0085],
    layer: 'muscles',
    order: 2,
  },
  {
    modelKey: 'heart',
    termKey: 'right_ventricle',
    meshName: 'VH_M_heart_right_ventricle',
    position: [0.0177, 0.4722, 0.0575],
    layer: 'muscles',
    order: 3,
  },
  {
    modelKey: 'heart',
    termKey: 'left_ventricle',
    meshName: 'VH_M_heart_left_ventricle',
    position: [0.0427, 0.4643, 0.0415],
    layer: 'muscles',
    order: 4,
  },
  {
    modelKey: 'heart',
    termKey: 'interventricular_septum',
    meshName: 'VH_M_interventricular_septum',
    position: [0.0326, 0.4633, 0.0501],
    layer: 'muscles',
    order: 5,
  },
];
