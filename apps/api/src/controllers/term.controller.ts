import type { NextFunction, Request, Response } from 'express';
import { createTermSchema, termListQuerySchema, updateTermSchema } from '@nabd/shared';
import * as termService from '../services/term.service';
import { ok } from '../utils/response';

// Student-facing: only `status: "verified"` content is returned.
export async function listTermsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = termListQuerySchema.parse(req.query);
    const result = await termService.listTerms(query, { onlyVerified: true });
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function getTermHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const key = req.params.key as string;
    const term = await termService.getTermByKey(key, { onlyVerified: true });
    res.json(ok(term));
  } catch (err) {
    next(err);
  }
}

// Editor / translator / admin: full list including drafts.
export async function listTermsAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = termListQuerySchema.parse(req.query);
    const result = await termService.listTerms(query);
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function createTermHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createTermSchema.parse(req.body);
    const term = await termService.createTerm(input, req.user?.id);
    res.status(201).json(ok(term));
  } catch (err) {
    next(err);
  }
}

export async function updateTermHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const key = req.params.key as string;
    const input = updateTermSchema.parse(req.body);
    const term = await termService.updateTerm(key, input);
    res.json(ok(term));
  } catch (err) {
    next(err);
  }
}

// Editor / translator / admin: counts for the dashboard stat cards.
export async function getTermStatsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await termService.getTermStats();
    res.json(ok(stats));
  } catch (err) {
    next(err);
  }
}
