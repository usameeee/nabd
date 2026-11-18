import type { FilterQuery } from 'mongoose';
import type {
  CreateTermInput,
  Role,
  TermListQuery,
  TermStats,
  UpdateTermInput,
} from '@nabd/shared';
import { AppError } from '../errors/AppError';
import { TermModel, type Term } from '../models/Term.model';

// Student-facing reads pass `{ onlyVerified: true }` so drafts never leak (docs/02 publishing gate).
interface ReadOptions {
  onlyVerified?: boolean;
}

// The authenticated caller; only these roles may flip a term to `verified` (docs/02).
export interface Actor {
  id: string;
  role: Role;
}

const REVIEWER_ROLES: Role[] = ['doctor_reviewer', 'admin'];

export async function listTerms(query: TermListQuery, options: ReadOptions = {}) {
  const { page, limit, category, status, q } = query;

  const filter: FilterQuery<Term> = {};
  if (options.onlyVerified) {
    filter.status = 'verified';
  } else if (status) {
    filter.status = status;
  }
  if (category) {
    filter.category = category;
  }
  if (q) {
    filter.$text = { $search: q };
  }

  const [items, total] = await Promise.all([
    TermModel.find(filter)
      .sort({ key: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    TermModel.countDocuments(filter),
  ]);

  return { items, page, limit, total };
}

export async function getTermByKey(key: string, options: ReadOptions = {}) {
  const filter: FilterQuery<Term> = { key };
  if (options.onlyVerified) {
    filter.status = 'verified';
  }

  const term = await TermModel.findOne(filter);
  if (!term) {
    throw new AppError('NOT_FOUND', 'Term not found', 404);
  }
  return term;
}

export async function createTerm(input: CreateTermInput, createdBy?: string) {
  const existing = await TermModel.findOne({ key: input.key });
  if (existing) {
    throw new AppError('TERM_EXISTS', 'A term with this key already exists', 409);
  }

  return TermModel.create({
    ...input,
    status: input.status ?? 'draft',
    createdBy: createdBy ?? undefined,
  });
}

// Only a doctor_reviewer (or admin) may publish a term; the review stamp is recorded server-side
// and cannot be set (or faked) through the request body (docs/02 publishing gate).
export async function updateTerm(key: string, input: UpdateTermInput, actor: Actor) {
  const update: UpdateTermInput & {
    reviewedBy?: string | null;
    reviewedAt?: Date | null;
  } = { ...input };

  if (input.status === 'verified') {
    if (!REVIEWER_ROLES.includes(actor.role)) {
      throw new AppError('FORBIDDEN', 'Only a doctor reviewer can verify a term', 403);
    }
    update.reviewedBy = actor.id;
    update.reviewedAt = new Date();
  } else if (input.status) {
    // Moving away from `verified` clears the review stamp so it can never mislead.
    update.reviewedBy = null;
    update.reviewedAt = null;
  }

  const term = await TermModel.findOneAndUpdate({ key }, update, { new: true });
  if (!term) {
    throw new AppError('NOT_FOUND', 'Term not found', 404);
  }
  return term;
}

export async function getTermStats(): Promise<TermStats> {
  const [total, drafts, needsReview, verified] = await Promise.all([
    TermModel.countDocuments({}),
    TermModel.countDocuments({ status: 'draft' }),
    TermModel.countDocuments({ status: 'needs_review' }),
    TermModel.countDocuments({ status: 'verified' }),
  ]);

  return { total, drafts, needsReview, verified };
}
