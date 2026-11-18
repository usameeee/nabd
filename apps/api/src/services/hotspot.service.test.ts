import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HotspotModel } from '../models/Hotspot.model';
import { createHotspot, deleteHotspot, updateHotspot } from './hotspot.service';

vi.mock('../models/Hotspot.model', () => ({
  HotspotModel: {
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

const create = vi.mocked(HotspotModel.create);
const findByIdAndUpdate = vi.mocked(HotspotModel.findByIdAndUpdate);
const findByIdAndDelete = vi.mocked(HotspotModel.findByIdAndDelete);

const input = {
  modelKey: 'heart',
  termKey: 'left_ventricle',
  position: [0.1, -0.2, 0.3] as [number, number, number],
  camera: { position: [1, 1, 1] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
  order: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createHotspot', () => {
  it('persists the hotspot', async () => {
    create.mockResolvedValue({ _id: 'abc', ...input } as never);

    await expect(createHotspot(input)).resolves.toMatchObject({ termKey: 'left_ventricle' });
    expect(create).toHaveBeenCalledWith(input);
  });
});

describe('updateHotspot', () => {
  it('rejects a malformed id as NOT_FOUND', async () => {
    await expect(updateHotspot('not-an-id', { order: 2 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when the hotspot does not exist', async () => {
    findByIdAndUpdate.mockResolvedValue(null as never);

    await expect(updateHotspot('64b7f0c2f1a2b3c4d5e6f7a8', { order: 2 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('returns the updated hotspot', async () => {
    findByIdAndUpdate.mockResolvedValue({ _id: '64b7f0c2f1a2b3c4d5e6f7a8', order: 3 } as never);

    await expect(updateHotspot('64b7f0c2f1a2b3c4d5e6f7a8', { order: 3 })).resolves.toMatchObject({
      order: 3,
    });
  });
});

describe('deleteHotspot', () => {
  it('rejects a malformed id as NOT_FOUND', async () => {
    await expect(deleteHotspot('nope')).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
    expect(findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when the hotspot does not exist', async () => {
    findByIdAndDelete.mockResolvedValue(null as never);

    await expect(deleteHotspot('64b7f0c2f1a2b3c4d5e6f7a8')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});
