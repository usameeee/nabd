// Model layers, mirroring docs/03's `models3d.layers` shape:
//   layers: [ { key: 'muscles' | 'vessels' | 'skeleton' | 'nerves', meshNames: string[] } ]
//
// Only the layers this model actually populates are listed (T-035: "only what the model
// supports"). The HRA heart is an organ model — 14 cardiac meshes (chambers, septum, valves,
// papillary muscles) and no vessels/skeleton/nerves — so `muscles` is the sole layer today and the
// chips row shows one chip. A richer model (e.g. Z-Anatomy, docs/04) adds entries here and the row
// grows on its own.
export type LayerKey = 'muscles' | 'vessels' | 'skeleton' | 'nerves';

export interface ModelLayer {
  key: LayerKey;
  /** GLB mesh/node names that belong to this layer (read off the model in T-033/T-035). */
  meshNames: string[];
}

export const HEART_LAYERS: ModelLayer[] = [
  {
    key: 'muscles',
    meshNames: [
      'VH_M_heart_left_ventricle',
      'VH_M_heart_right_ventricle',
      'VH_M_left_cardiac_atrium',
      'VH_M_right_cardiac_atrium',
      'VH_M_interventricular_septum',
      'VH_M_mitral_valve',
      'VH_M_tricuspid_valve',
      'VH_M_aortic_valve',
      'VH_M_pulmonary_valve',
      'VH_M_papillary_muscle_of_heart_anterior',
      'VH_M_papillary_muscle_of_heart_anterolateral',
      'VH_M_papillary_muscle_of_heart_medial',
      'VH_M_papillary_muscle_of_heart_posterior',
      'VH_M_papillary_muscle_of_heart_posteromedial',
    ],
  },
];
