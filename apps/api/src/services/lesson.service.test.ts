import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LessonModel } from '../models/Lesson.model';
import { createLesson, getLessonByKey, updateLesson } from './lesson.service';

vi.mock('../models/Lesson.model', () => ({
  LessonModel: { findOne: vi.fn(), findOneAndUpdate: vi.fn() },
}));

const findOne = vi.mocked(LessonModel.findOne);
const findOneAndUpdate = vi.mocked(LessonModel.findOneAndUpdate);

const input = {
  key: 'heart_circulation',
  title: { ar: 'القلب والدورة الدموية' },
  unit: 'cardiology',
  order: 1,
  steps: [{ type: 'explain' as const, ref: {}, xp: 5 }],
  termKeys: ['heart'],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createLesson', () => {
  it('rejects a duplicate key', async () => {
    findOne.mockResolvedValue({ key: 'heart_circulation' } as never);

    await expect(createLesson(input)).rejects.toMatchObject({
      code: 'LESSON_EXISTS',
      status: 409,
    });
  });
});

describe('getLessonByKey', () => {
  it('gates student reads to verified lessons', async () => {
    findOne.mockResolvedValue(null as never);

    await expect(getLessonByKey('heart_circulation', { onlyVerified: true })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
    expect(findOne).toHaveBeenCalledWith({ key: 'heart_circulation', status: 'verified' });
  });

  it('returns the lesson for an editor read', async () => {
    findOne.mockResolvedValue({ key: 'heart_circulation' } as never);

    await expect(getLessonByKey('heart_circulation')).resolves.toMatchObject({
      key: 'heart_circulation',
    });
    expect(findOne).toHaveBeenCalledWith({ key: 'heart_circulation' });
  });
});

describe('updateLesson', () => {
  it('throws NOT_FOUND when the lesson does not exist', async () => {
    findOneAndUpdate.mockResolvedValue(null as never);

    await expect(updateLesson('missing', { status: 'verified' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('publishes by flipping status to verified', async () => {
    findOneAndUpdate.mockResolvedValue({ key: 'heart_circulation', status: 'verified' } as never);

    await expect(updateLesson('heart_circulation', { status: 'verified' })).resolves.toMatchObject({
      status: 'verified',
    });
  });
});
