import { describe, expect, it } from 'vitest';
import { createLessonSchema, lessonListQuerySchema, updateLessonSchema } from './lesson';

const validLesson = {
  key: 'heart_circulation',
  title: { ar: 'القلب والدورة الدموية', fr: 'Cœur et circulation', en: 'Heart and circulation' },
  unit: 'cardiology',
  order: 1,
  faculty: 'medicine',
  year: 1,
  steps: [
    { type: 'explain', ref: {}, xp: 5 },
    { type: 'viewer', ref: { modelKey: 'heart', hotspotIds: ['65f1c2a4e1b2c3d4e5f6a7b8'] }, xp: 10 },
    { type: 'quiz', ref: { quizId: 'quiz_heart' }, xp: 20 },
  ],
  termKeys: ['heart', 'left_ventricle'],
};

describe('createLessonSchema', () => {
  it('accepts a valid lesson', () => {
    expect(createLessonSchema.safeParse(validLesson).success).toBe(true);
  });

  it('defaults steps and termKeys to [] and fills an empty step ref', () => {
    const parsed = createLessonSchema.parse({
      key: 'heart_circulation',
      title: { ar: 'القلب' },
      unit: 'cardiology',
      order: 1,
      steps: [{ type: 'explain', xp: 5 }],
    });
    expect(parsed.steps).toEqual([{ type: 'explain', ref: {}, xp: 5 }]);
    expect(parsed.termKeys).toEqual([]);
  });

  it('requires the core fields', () => {
    for (const field of ['key', 'title', 'unit', 'order'] as const) {
      const bad: Record<string, unknown> = { ...validLesson };
      delete bad[field];
      expect(createLessonSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('requires an Arabic title', () => {
    const bad = { ...validLesson, title: { fr: 'Cœur' } };
    expect(createLessonSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an unknown step type', () => {
    const bad = { ...validLesson, steps: [{ type: 'audio', ref: {}, xp: 1 }] };
    expect(createLessonSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a negative xp', () => {
    const bad = { ...validLesson, steps: [{ type: 'explain', ref: {}, xp: -1 }] };
    expect(createLessonSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a non-snake_case term key', () => {
    const bad = { ...validLesson, termKeys: ['Left Ventricle'] };
    expect(createLessonSchema.safeParse(bad).success).toBe(false);
  });
});

describe('updateLessonSchema', () => {
  it('allows a partial patch and forbids changing the key', () => {
    expect(updateLessonSchema.safeParse({ status: 'verified' }).success).toBe(true);
    expect(updateLessonSchema.safeParse({ key: 'other' }).success).toBe(false);
  });
});

describe('lessonListQuerySchema', () => {
  it('applies paging defaults and coerces query strings', () => {
    expect(lessonListQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(lessonListQuerySchema.parse({ page: '2', limit: '5' })).toEqual({ page: 2, limit: 5 });
  });

  it('rejects an unknown status', () => {
    expect(lessonListQuerySchema.safeParse({ status: 'published' }).success).toBe(false);
  });
});
