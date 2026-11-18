import { describe, expect, it } from 'vitest';
import { createModelSchema, modelListQuerySchema, updateModelSchema } from './model';

const validModel = {
  key: 'heart',
  titleTermKey: 'heart',
  system: 'cardiovascular',
  versions: {
    light: {
      url: 'https://cdn.nabd.app/models/heart.light.glb',
      sizeBytes: 1_394_000,
      polyCount: 18_000,
    },
  },
  layers: [{ key: 'muscles', meshNames: ['VH_M_heart_left_ventricle'] }],
  license: 'CC BY 4.0',
  attribution: 'Human Reference Atlas (HRA)',
  sourceUrl: 'https://humanatlas.io',
};

describe('createModelSchema', () => {
  it('accepts a valid model', () => {
    expect(createModelSchema.safeParse(validModel).success).toBe(true);
  });

  it('defaults layers to an empty list', () => {
    const { layers, ...withoutLayers } = validModel;
    expect(createModelSchema.parse(withoutLayers).layers).toEqual([]);
  });

  it('requires license, attribution and sourceUrl', () => {
    for (const field of ['license', 'attribution', 'sourceUrl'] as const) {
      const bad: Record<string, unknown> = { ...validModel };
      delete bad[field];
      expect(createModelSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('rejects a version url that is not a URL', () => {
    const bad = {
      ...validModel,
      versions: { light: { ...validModel.versions.light, url: 'not-a-url' } },
    };
    expect(createModelSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an unknown layer key', () => {
    const bad = { ...validModel, layers: [{ key: 'organs', meshNames: ['x'] }] };
    expect(createModelSchema.safeParse(bad).success).toBe(false);
  });
});

describe('updateModelSchema', () => {
  it('allows a partial patch and forbids changing the key', () => {
    expect(updateModelSchema.safeParse({ status: 'verified' }).success).toBe(true);
    expect(updateModelSchema.safeParse({ key: 'other' }).success).toBe(false);
  });
});

describe('modelListQuerySchema', () => {
  it('applies paging defaults and coerces query strings', () => {
    expect(modelListQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(modelListQuerySchema.parse({ page: '2', limit: '10' })).toEqual({ page: 2, limit: 10 });
  });

  it('rejects an unknown system', () => {
    expect(modelListQuerySchema.safeParse({ system: 'gastric' }).success).toBe(false);
  });
});
