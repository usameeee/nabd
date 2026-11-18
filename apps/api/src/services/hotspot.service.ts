import { isValidObjectId, type FilterQuery } from 'mongoose';
import type { CreateHotspotInput, HotspotListQuery, UpdateHotspotInput } from '@nabd/shared';
import { AppError } from '../errors/AppError';
import { HotspotModel, type Hotspot } from '../models/Hotspot.model';

export async function listHotspots(query: HotspotListQuery) {
  const { page, limit, modelKey, layer } = query;

  const filter: FilterQuery<Hotspot> = {};
  if (modelKey) {
    filter.modelKey = modelKey;
  }
  if (layer) {
    filter.layer = layer;
  }

  const [items, total] = await Promise.all([
    HotspotModel.find(filter)
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    HotspotModel.countDocuments(filter),
  ]);

  return { items, page, limit, total };
}

export async function createHotspot(input: CreateHotspotInput) {
  return HotspotModel.create(input);
}

// Hotspots are addressed by their Mongo id. A malformed id is a missing record, not a 500.
function assertObjectId(id: string): void {
  if (!isValidObjectId(id)) {
    throw new AppError('NOT_FOUND', 'Hotspot not found', 404);
  }
}

export async function updateHotspot(id: string, input: UpdateHotspotInput) {
  assertObjectId(id);

  const doc = await HotspotModel.findByIdAndUpdate(id, input, { new: true });
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Hotspot not found', 404);
  }
  return doc;
}

export async function deleteHotspot(id: string) {
  assertObjectId(id);

  const doc = await HotspotModel.findByIdAndDelete(id);
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Hotspot not found', 404);
  }
  return doc;
}
