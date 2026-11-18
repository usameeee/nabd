import type { FilterQuery } from 'mongoose';
import type { CreateModelInput, ModelListQuery, UpdateModelInput } from '@nabd/shared';
import { AppError } from '../errors/AppError';
import { Model3DModel, type Model3D } from '../models/Model3D.model';

// Student-facing reads pass `{ onlyVerified: true }` so drafts never leak (docs/02 publishing gate).
interface ReadOptions {
  onlyVerified?: boolean;
}

export async function listModels(query: ModelListQuery, options: ReadOptions = {}) {
  const { page, limit, system, status, q } = query;

  const filter: FilterQuery<Model3D> = {};
  if (options.onlyVerified) {
    filter.status = 'verified';
  } else if (status) {
    filter.status = status;
  }
  if (system) {
    filter.system = system;
  }
  if (q) {
    filter.key = { $regex: q, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Model3DModel.find(filter)
      .sort({ key: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Model3DModel.countDocuments(filter),
  ]);

  return { items, page, limit, total };
}

export async function getModelByKey(key: string, options: ReadOptions = {}) {
  const filter: FilterQuery<Model3D> = { key };
  if (options.onlyVerified) {
    filter.status = 'verified';
  }

  const doc = await Model3DModel.findOne(filter);
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Model not found', 404);
  }
  return doc;
}

export async function createModel(input: CreateModelInput, createdBy?: string) {
  const existing = await Model3DModel.findOne({ key: input.key });
  if (existing) {
    throw new AppError('MODEL_EXISTS', 'A model with this key already exists', 409);
  }

  return Model3DModel.create({
    ...input,
    status: input.status ?? 'draft',
    createdBy: createdBy ?? undefined,
  });
}

export async function updateModel(key: string, input: UpdateModelInput) {
  const doc = await Model3DModel.findOneAndUpdate({ key }, input, { new: true });
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Model not found', 404);
  }
  return doc;
}
