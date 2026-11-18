import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Model3DModel } from '../models/Model3D.model';
import { createModel, getModelByKey, updateModel } from './model.service';

vi.mock('../models/Model3D.model', () => ({
  Model3DModel: { findOne: vi.fn(), findOneAndUpdate: vi.fn() },
}));

const findOne = vi.mocked(Model3DModel.findOne);
const findOneAndUpdate = vi.mocked(Model3DModel.findOneAndUpdate);

const input = {
  key: 'heart',
  titleTermKey: 'heart',
  system: 'cardiovascular' as const,
  versions: {
    light: { url: 'https://cdn.nabd.app/heart.light.glb', sizeBytes: 1_394_000, polyCount: 18_000 },
  },
  layers: [],
  license: 'CC BY 4.0',
  attribution: 'Human Reference Atlas (HRA)',
  sourceUrl: 'https://humanatlas.io',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createModel', () => {
  it('rejects a duplicate key', async () => {
    findOne.mockResolvedValue({ key: 'heart' } as never);

    await expect(createModel(input)).rejects.toMatchObject({ code: 'MODEL_EXISTS', status: 409 });
  });
});

describe('getModelByKey', () => {
  it('gates student reads to verified models', async () => {
    findOne.mockResolvedValue(null as never);

    await expect(getModelByKey('heart', { onlyVerified: true })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
    expect(findOne).toHaveBeenCalledWith({ key: 'heart', status: 'verified' });
  });

  it('returns the model for an editor read', async () => {
    findOne.mockResolvedValue({ key: 'heart' } as never);

    await expect(getModelByKey('heart')).resolves.toMatchObject({ key: 'heart' });
    expect(findOne).toHaveBeenCalledWith({ key: 'heart' });
  });
});

describe('updateModel', () => {
  it('throws NOT_FOUND when the model does not exist', async () => {
    findOneAndUpdate.mockResolvedValue(null as never);

    await expect(updateModel('missing', { license: 'CC BY 4.0' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('publishes by flipping status to verified', async () => {
    findOneAndUpdate.mockResolvedValue({ key: 'heart', status: 'verified' } as never);

    await expect(updateModel('heart', { status: 'verified' })).resolves.toMatchObject({
      status: 'verified',
    });
  });
});
