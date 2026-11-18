import type {
  ModelLayerDef,
  ModelLayerKey,
  ModelStatus,
  ModelSystem,
  ModelVersion,
} from '@nabd/shared';
import { apiFetch } from './client';

// Shapes returned by the API (`GET /models/manage`, `GET /hotspots`) — serialized
// Mongoose documents (see docs/03: models3d + hotspots).
export interface Model3D {
  _id: string;
  key: string;
  titleTermKey: string;
  system: ModelSystem;
  versions: { light: ModelVersion; detailed?: ModelVersion };
  layers: ModelLayerDef[];
  license: string;
  attribution: string;
  sourceUrl: string;
  status: ModelStatus;
}

export interface ModelListParams {
  page?: number;
  limit?: number;
  system?: ModelSystem;
  status?: ModelStatus;
  q?: string;
}

export interface ModelList {
  items: Model3D[];
  page: number;
  limit: number;
  total: number;
}

// `key` is only sent on create — the API rejects it on PATCH (docs/02, D-037).
export type ModelInput = Omit<Model3D, '_id' | 'key'> & { key?: string };

export interface Hotspot {
  _id: string;
  modelKey: string;
  termKey: string;
  meshName?: string;
  position: [number, number, number];
  layer?: ModelLayerKey;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    zoom?: number;
  };
  order: number;
}

export interface HotspotListParams {
  page?: number;
  limit?: number;
  modelKey?: string;
  layer?: ModelLayerKey;
}

export interface HotspotList {
  items: Hotspot[];
  page: number;
  limit: number;
  total: number;
}

export type HotspotInput = Omit<Hotspot, '_id'>;

function toQuery(params: ModelListParams | HotspotListParams): string {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(name, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function listModels(params: ModelListParams, token: string): Promise<ModelList> {
  return apiFetch<ModelList>(`/models/manage${toQuery(params)}`, { token });
}

export function createModel(input: ModelInput, token: string): Promise<Model3D> {
  return apiFetch<Model3D>('/models', { method: 'POST', body: input, token });
}

export function updateModel(key: string, input: ModelInput, token: string): Promise<Model3D> {
  return apiFetch<Model3D>(`/models/${key}`, { method: 'PATCH', body: input, token });
}

export function listHotspots(params: HotspotListParams, token: string): Promise<HotspotList> {
  return apiFetch<HotspotList>(`/hotspots${toQuery(params)}`, { token });
}

export function createHotspot(input: HotspotInput, token: string): Promise<Hotspot> {
  return apiFetch<Hotspot>('/hotspots', { method: 'POST', body: input, token });
}

export function updateHotspot(id: string, input: HotspotInput, token: string): Promise<Hotspot> {
  return apiFetch<Hotspot>(`/hotspots/${id}`, { method: 'PATCH', body: input, token });
}

export function deleteHotspot(id: string, token: string): Promise<Hotspot> {
  return apiFetch<Hotspot>(`/hotspots/${id}`, { method: 'DELETE', token });
}
