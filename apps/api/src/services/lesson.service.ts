import type { FilterQuery } from 'mongoose';
import type { CreateLessonInput, LessonListQuery, UpdateLessonInput } from '@nabd/shared';
import { AppError } from '../errors/AppError';
import { LessonModel, type Lesson } from '../models/Lesson.model';

// Student-facing reads pass `{ onlyVerified: true }` so drafts never leak (docs/02 publishing gate).
interface ReadOptions {
  onlyVerified?: boolean;
}

export async function listLessons(query: LessonListQuery, options: ReadOptions = {}) {
  const { page, limit, unit, status, q } = query;

  const filter: FilterQuery<Lesson> = {};
  if (options.onlyVerified) {
    filter.status = 'verified';
  } else if (status) {
    filter.status = status;
  }
  if (unit) {
    filter.unit = unit;
  }
  if (q) {
    filter.key = { $regex: q, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    LessonModel.find(filter)
      .sort({ unit: 1, order: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    LessonModel.countDocuments(filter),
  ]);

  return { items, page, limit, total };
}

export async function getLessonByKey(key: string, options: ReadOptions = {}) {
  const filter: FilterQuery<Lesson> = { key };
  if (options.onlyVerified) {
    filter.status = 'verified';
  }

  const doc = await LessonModel.findOne(filter);
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Lesson not found', 404);
  }
  return doc;
}

export async function createLesson(input: CreateLessonInput, createdBy?: string) {
  const existing = await LessonModel.findOne({ key: input.key });
  if (existing) {
    throw new AppError('LESSON_EXISTS', 'A lesson with this key already exists', 409);
  }

  return LessonModel.create({
    ...input,
    status: input.status ?? 'draft',
    createdBy: createdBy ?? undefined,
  });
}

export async function updateLesson(key: string, input: UpdateLessonInput) {
  const doc = await LessonModel.findOneAndUpdate({ key }, input, { new: true });
  if (!doc) {
    throw new AppError('NOT_FOUND', 'Lesson not found', 404);
  }
  return doc;
}
