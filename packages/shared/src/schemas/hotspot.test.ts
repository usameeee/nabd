import { describe, expect, it } from 'vitest';
import { createHotspotSchema, hotspotListQuerySchema, updateHotspotSchema } from './hotspot';

const validHotspot = {
  modelKey: 'heart',
  termKey: 'left_ventricle',
  meshName: 'VH_M_heart_left_ventricle',
  position: [0.0427, 0.4643, 0.0415],
  layer: 'muscles',
  camera: { position: [0, 0, 2.4], target: [0.04, 0.46, 0.04] },
  order: 4,
};

describe('createHotspotSchema', () => {
  it('accepts a valid hotspot', () => {
    expect(createHotspotSchema.safeParse(validHotspot).success).toBe(true);
  });

  it('requires a 3-number position', () => {
    expect(createHotspotSchema.safeParse({ ...validHotspot, position: [1, 2] }).success).toBe(false);
  });

  it('requires the camera block', () => {
    const { camera, ...withoutCamera } = validHotspot;
    expect(createHotspotSchema.safeParse(withoutCamera).success).toBe(false);
  });

  it('rejects an order below 1', () => {
    expect(createHotspotSchema.safeParse({ ...validHotspot, order: 0 }).success).toBe(false);
  });
});

describe('updateHotspotSchema', () => {
  it('allows a partial patch but rejects unknown fields', () => {
    expect(updateHotspotSchema.safeParse({ order: 9 }).success).toBe(true);
    expect(updateHotspotSchema.safeParse({ id: 'x' }).success).toBe(false);
  });
});

describe('hotspotListQuerySchema', () => {
  it('defaults paging and accepts a model filter', () => {
    expect(hotspotListQuerySchema.parse({})).toEqual({ page: 1, limit: 50 });
    expect(hotspotListQuerySchema.parse({ modelKey: 'heart' }).modelKey).toBe('heart');
  });
});
