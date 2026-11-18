import type { FilterQuery } from 'mongoose';
import type { CreateDiseaseInput, DiseaseListQuery, UpdateDiseaseInput } from '@nabd/shared';
import { AppError } from '../errors/AppError';
import { DiseaseModel, type Disease } from '../models/Disease.model';

// Student-facing reads pass `{ onlyVerified: true }` so drafts never leak (docs/02 publishing gate).
interface ReadOptions {
  onlyVerified?: boolean;
}

export async function listDiseases(query: DiseaseListQuery, options: ReadOptions = {}) {
  const { page, limit, modelKey, status, q } = query;

  const filter: FilterQuery<Disease> = {};
  if (options.onlyVerified) {
    filter.status = 'verified';
  } else if (status) {
    filter.status = status;
  }
  if (modelKey) {
    filter.modelKey = modelKey;
  }
  if (q) {
    filter.key = { $regex: q, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    DiseaseModel.find(filter)
      .sort({ key: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DiseaseModel.countDocuments(filter),
  ]);

  return { items, page, limit, total };
}

export async function getDiseaseByKey(key: string, options: ReadOptions = {}) {
  const filter: FilterQuery<Disease> = { key };
  if (options.onlyVerified) {
    filter.status = 'verified';
  }

  const doc = await DiseaseModel.findOne(filter);
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Disease not found', 404);
  }
  return doc;
}

export async function createDisease(input: CreateDiseaseInput, createdBy?: string) {
  const existing = await DiseaseModel.findOne({ key: input.key });
  if (existing) {
    throw new AppError('DISEASE_EXISTS', 'A disease with this key already exists', 409);
  }

  return DiseaseModel.create({
    ...input,
    status: input.status ?? 'draft',
    createdBy: createdBy ?? undefined,
  });
}

export async function updateDisease(key: string, input: UpdateDiseaseInput) {
  const doc = await DiseaseModel.findOneAndUpdate({ key }, input, { new: true });
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Disease not found', 404);
  }
  return doc;
}
