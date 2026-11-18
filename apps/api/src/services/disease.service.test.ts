import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiseaseModel } from '../models/Disease.model';
import { createDisease, getDiseaseByKey, updateDisease } from './disease.service';

vi.mock('../models/Disease.model', () => ({
  DiseaseModel: { findOne: vi.fn(), findOneAndUpdate: vi.fn() },
}));

const findOne = vi.mocked(DiseaseModel.findOne);
const findOneAndUpdate = vi.mocked(DiseaseModel.findOneAndUpdate);

const input = {
  key: 'myocardial_infarction',
  termKey: 'myocardial_infarction',
  modelKey: 'heart',
  stages: [{ key: 'healthy', visual: {} }],
  symptomTermKeys: ['chest_pain'],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createDisease', () => {
  it('rejects a duplicate key', async () => {
    findOne.mockResolvedValue({ key: 'myocardial_infarction' } as never);

    await expect(createDisease(input)).rejects.toMatchObject({
      code: 'DISEASE_EXISTS',
      status: 409,
    });
  });
});

describe('getDiseaseByKey', () => {
  it('gates student reads to verified diseases', async () => {
    findOne.mockResolvedValue(null as never);

    await expect(getDiseaseByKey('myocardial_infarction', { onlyVerified: true })).rejects.toMatchObject(
      { code: 'NOT_FOUND', status: 404 },
    );
    expect(findOne).toHaveBeenCalledWith({ key: 'myocardial_infarction', status: 'verified' });
  });

  it('returns the disease for an editor read', async () => {
    findOne.mockResolvedValue({ key: 'myocardial_infarction' } as never);

    await expect(getDiseaseByKey('myocardial_infarction')).resolves.toMatchObject({
      key: 'myocardial_infarction',
    });
    expect(findOne).toHaveBeenCalledWith({ key: 'myocardial_infarction' });
  });
});

describe('updateDisease', () => {
  it('throws NOT_FOUND when the disease does not exist', async () => {
    findOneAndUpdate.mockResolvedValue(null as never);

    await expect(updateDisease('missing', { status: 'verified' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('publishes by flipping status to verified', async () => {
    findOneAndUpdate.mockResolvedValue({ key: 'myocardial_infarction', status: 'verified' } as never);

    await expect(updateDisease('myocardial_infarction', { status: 'verified' })).resolves.toMatchObject({
      status: 'verified',
    });
  });
});
