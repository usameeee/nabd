import { describe, expect, it } from 'vitest';
import { createDiseaseSchema, diseaseListQuerySchema, updateDiseaseSchema } from './disease';

const validDisease = {
  key: 'myocardial_infarction',
  termKey: 'myocardial_infarction',
  icd11: { code: 'BA41', uri: 'https://icd.who.int/browse/2024-01/mms/en#123' },
  modelKey: 'heart',
  stages: [
    { key: 'healthy', visual: {} },
    {
      key: 'narrowing',
      labelTermKey: 'coronary_narrowing',
      visual: { highlightMeshes: ['VH_M_coronary_artery'], vesselNarrowing: 0.6 },
    },
  ],
  symptomTermKeys: ['chest_pain', 'dyspnea'],
  videoIds: ['vid_infarct_intro'],
  quizId: 'quiz_infarct',
};

describe('createDiseaseSchema', () => {
  it('accepts a valid disease', () => {
    expect(createDiseaseSchema.safeParse(validDisease).success).toBe(true);
  });

  it('defaults stages to [] and fills an empty stage visual', () => {
    const parsed = createDiseaseSchema.parse({
      key: 'myocardial_infarction',
      termKey: 'myocardial_infarction',
      modelKey: 'heart',
      stages: [{ key: 'healthy' }],
    });
    expect(parsed.stages).toEqual([{ key: 'healthy', visual: {} }]);
    expect(parsed.symptomTermKeys).toEqual([]);
  });

  it('requires the core references', () => {
    for (const field of ['key', 'termKey', 'modelKey'] as const) {
      const bad: Record<string, unknown> = { ...validDisease };
      delete bad[field];
      expect(createDiseaseSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('rejects a non-snake_case term key', () => {
    const bad = { ...validDisease, termKey: 'Myocardial Infarction' };
    expect(createDiseaseSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a vesselNarrowing outside 0–1', () => {
    const bad = {
      ...validDisease,
      stages: [{ key: 'infarct', visual: { vesselNarrowing: 2 } }],
    };
    expect(createDiseaseSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an icd11 uri that is not a URL', () => {
    const bad = { ...validDisease, icd11: { uri: 'not-a-url' } };
    expect(createDiseaseSchema.safeParse(bad).success).toBe(false);
  });
});

describe('updateDiseaseSchema', () => {
  it('allows a partial patch and forbids changing the key', () => {
    expect(updateDiseaseSchema.safeParse({ status: 'verified' }).success).toBe(true);
    expect(updateDiseaseSchema.safeParse({ key: 'other' }).success).toBe(false);
  });
});

describe('diseaseListQuerySchema', () => {
  it('applies paging defaults and coerces query strings', () => {
    expect(diseaseListQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(diseaseListQuerySchema.parse({ page: '3', limit: '5' })).toEqual({ page: 3, limit: 5 });
  });

  it('rejects an unknown status', () => {
    expect(diseaseListQuerySchema.safeParse({ status: 'published' }).success).toBe(false);
  });
});
