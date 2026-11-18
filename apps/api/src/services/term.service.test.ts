import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TermModel } from '../models/Term.model';
import { updateTerm } from './term.service';

vi.mock('../models/Term.model', () => ({
  TermModel: { findOneAndUpdate: vi.fn() },
}));

const findOneAndUpdate = vi.mocked(TermModel.findOneAndUpdate);

// Mongoose's overloaded findOneAndUpdate makes the args tuple awkward to destructure; read it plainly.
function updateOfLastCall(): Record<string, unknown> {
  const call = findOneAndUpdate.mock.calls[0] as unknown as [unknown, Record<string, unknown>];
  return call[1];
}

beforeEach(() => {
  vi.clearAllMocks();
  findOneAndUpdate.mockResolvedValue({ key: 'left_ventricle' } as never);
});

describe('updateTerm review gate (docs/02 publishing gate)', () => {
  it('saves the audit fields when a doctor_reviewer marks verified', async () => {
    await updateTerm(
      'left_ventricle',
      { status: 'verified' },
      { id: 'doc1', role: 'doctor_reviewer' },
    );

    const update = updateOfLastCall();
    expect(update.status).toBe('verified');
    expect(update.reviewedBy).toBe('doc1');
    expect(update.reviewedAt).toBeInstanceOf(Date);
  });

  it('lets an admin verify too', async () => {
    await updateTerm('left_ventricle', { status: 'verified' }, { id: 'a1', role: 'admin' });

    expect(updateOfLastCall().reviewedBy).toBe('a1');
  });

  it('rejects a non-reviewer trying to publish', async () => {
    await expect(
      updateTerm('left_ventricle', { status: 'verified' }, { id: 'e1', role: 'editor' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('does not touch audit fields on a plain edit', async () => {
    await updateTerm('left_ventricle', { ar: 'البطين الأيسر' }, { id: 'e1', role: 'editor' });

    const update = updateOfLastCall();
    expect(update).not.toHaveProperty('reviewedBy');
    expect(update).not.toHaveProperty('reviewedAt');
  });

  it('clears the review stamp when a verified term is sent back', async () => {
    await updateTerm(
      'left_ventricle',
      { status: 'needs_review' },
      { id: 'doc1', role: 'doctor_reviewer' },
    );

    const update = updateOfLastCall();
    expect(update.reviewedBy).toBeNull();
    expect(update.reviewedAt).toBeNull();
  });

  it('throws NOT_FOUND when the term does not exist', async () => {
    findOneAndUpdate.mockResolvedValueOnce(null as never);

    await expect(
      updateTerm('missing', { ar: 'x' }, { id: 'e1', role: 'editor' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
