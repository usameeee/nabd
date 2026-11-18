import type { NextFunction, Request, Response } from 'express';
import { attributionListQuerySchema } from '@nabd/shared';
import * as attributionService from '../services/attribution.service';
import { ok } from '../utils/response';

// Public read: the "Sources & licenses" page credits published content only (docs/02 gate).
export async function listAttributionsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = attributionListQuerySchema.parse(req.query);
    const result = await attributionService.listAttributions(query, { onlyVerified: true });
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}
