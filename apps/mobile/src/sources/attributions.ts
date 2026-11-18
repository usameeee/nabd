import type { AttributionEntry } from '@nabd/shared';
import { apiGet, isApiConfigured } from '../api/client';
import { readCache, writeCache } from '../offline/cache';

// Offline-first attribution loader (T-052) — the same seam as the lesson loader (T-050). The
// "Sources & licenses" page is a GENERATED view built from the `license`/`attribution` fields of the
// content collections (docs/03 → attributions), so it is read cache → API (when configured) →
// bundled fixture: the credits always render, online or not.

export type AttributionOrigin = 'network' | 'cache' | 'bundled';

export interface AttributionResult {
  entries: AttributionEntry[];
  /** Where this copy came from — `bundled` means the device had nothing cached yet. */
  origin: AttributionOrigin;
}

const CACHE_KEY = 'attributions';

// Bundled copy of the generated view. It mirrors what the currently shipped content produces: the
// HRA heart model (CC BY 4.0) and the hand-authored anatomy glossary (MANUAL / PROPRIETARY). The
// live endpoint lists every row — this is a representative subset so the page has body offline.
export const ATTRIBUTIONS_FIXTURE: AttributionEntry[] = [
  {
    key: 'heart',
    kind: 'model',
    title: 'heart',
    license: 'CC BY 4.0',
    attribution:
      'HuBMAP CCF 3D Reference Object Library — 3D Reference Organ for Heart, Male (v1.3). Schlehlein, H., Herr II, B. W., Quardokus, E. M., Bueckle, A., & Börner, K. (2022). HuBMAP CCF 3D Reference Object Library. Built from the Visible Human Project male dataset (U.S. National Library of Medicine).',
    sourceUrl: 'https://humanatlas.io/3d-reference-library',
  },
  {
    key: 'heart',
    kind: 'term',
    title: 'القلب',
    license: 'PROPRIETARY',
    attribution: 'Nabd editorial (anatomy glossary)',
  },
  {
    key: 'left_ventricle',
    kind: 'term',
    title: 'البطين الأيسر',
    license: 'PROPRIETARY',
    attribution: 'Nabd editorial (anatomy glossary)',
  },
  {
    key: 'mitral_valve',
    kind: 'term',
    title: 'الصمام المترالي',
    license: 'PROPRIETARY',
    attribution: 'Nabd editorial (anatomy glossary)',
  },
];

function isAttributionList(value: unknown): value is AttributionEntry[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => {
      if (typeof entry !== 'object' || entry === null) return false;
      const item = entry as Record<string, unknown>;
      return (
        typeof item.key === 'string' &&
        typeof item.kind === 'string' &&
        typeof item.title === 'string' &&
        typeof item.license === 'string' &&
        typeof item.attribution === 'string'
      );
    })
  );
}

/** Loads the attribution view offline-first: cache → API (when configured) → bundled fixture. */
export async function loadAttributions(): Promise<AttributionResult> {
  const cached = await readCache<AttributionEntry[]>(CACHE_KEY);
  if (isAttributionList(cached)) return { entries: cached, origin: 'cache' };

  if (isApiConfigured()) {
    const result = await apiGet<{ items?: unknown }>('/attributions');
    const items = result.ok ? result.data.items : undefined;
    if (isAttributionList(items)) {
      await writeCache(CACHE_KEY, items);
      return { entries: items, origin: 'network' };
    }
  }

  // Seed the cache from the bundled fixture so the next open is instant (and survives a restart).
  await writeCache(CACHE_KEY, ATTRIBUTIONS_FIXTURE);
  return { entries: ATTRIBUTIONS_FIXTURE, origin: 'bundled' };
}
