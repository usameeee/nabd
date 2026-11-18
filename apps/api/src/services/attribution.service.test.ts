import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Model3DModel } from '../models/Model3D.model';
import { TermModel } from '../models/Term.model';
import { listAttributions } from './attribution.service';

vi.mock('../models/Model3D.model', () => ({ Model3DModel: { find: vi.fn() } }));
vi.mock('../models/Term.model', () => ({ TermModel: { find: vi.fn() } }));

const modelFind = vi.mocked(Model3DModel.find);
const termFind = vi.mocked(TermModel.find);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listAttributions', () => {
  it('gates public reads to verified content', async () => {
    modelFind.mockResolvedValue([] as never);
    termFind.mockResolvedValue([] as never);

    await listAttributions({ page: 1, limit: 50 }, { onlyVerified: true });

    expect(modelFind).toHaveBeenCalledWith({ status: 'verified' });
    expect(termFind).toHaveBeenCalledWith({ status: 'verified' });
  });

  it('derives an entry per model and term, falling back to the term source', async () => {
    modelFind.mockResolvedValue([
      {
        key: 'heart',
        license: 'CC BY 4.0',
        attribution: 'Human Reference Atlas (HRA)',
        sourceUrl: 'https://humanatlas.io',
      },
    ] as never);
    termFind.mockResolvedValue([
      { key: 'left_ventricle', ar: 'البطين الأيسر', license: 'PROPRIETARY', source: 'MANUAL' },
    ] as never);

    const result = await listAttributions({ page: 1, limit: 50 });

    expect(result.total).toBe(2);
    expect(result.items).toEqual([
      {
        key: 'heart',
        kind: 'model',
        title: 'heart',
        license: 'CC BY 4.0',
        attribution: 'Human Reference Atlas (HRA)',
        sourceUrl: 'https://humanatlas.io',
      },
      {
        key: 'left_ventricle',
        kind: 'term',
        title: 'البطين الأيسر',
        license: 'PROPRIETARY',
        attribution: 'MANUAL',
        sourceUrl: undefined,
      },
    ]);
  });

  it('pages the generated list', async () => {
    modelFind.mockResolvedValue([] as never);
    termFind.mockResolvedValue(
      Array.from({ length: 6 }, (_, index) => ({
        key: `t${index}`,
        ar: `مصطلح ${index}`,
        license: 'PROPRIETARY',
        source: 'MANUAL',
      })) as never,
    );

    const result = await listAttributions({ page: 2, limit: 5 });

    expect(result.total).toBe(6);
    expect(result.items).toHaveLength(1);
  });

  it('narrows to one kind without querying the other collection', async () => {
    termFind.mockResolvedValue([] as never);

    await listAttributions({ page: 1, limit: 50, kind: 'term' });

    expect(modelFind).not.toHaveBeenCalled();
    expect(termFind).toHaveBeenCalled();
  });
});
