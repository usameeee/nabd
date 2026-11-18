import type { NextFunction, Request, Response } from 'express';
import { createDiseaseSchema, diseaseListQuerySchema, updateDiseaseSchema } from '@nabd/shared';
import * as diseaseService from '../services/disease.service';
import { ok } from '../utils/response';

// Student-facing: only `status: "verified"` diseases are returned.
export async function listDiseasesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = diseaseListQuerySchema.parse(req.query);
    const result = await diseaseService.listDiseases(query, { onlyVerified: true });
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function getDiseaseHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const key = req.params.key as string;
    const doc = await diseaseService.getDiseaseByKey(key, { onlyVerified: true });
    res.json(ok(doc));
  } catch (err) {
    next(err);
  }
}

// Editor / doctor reviewer / admin: full list including drafts.
export async function listDiseasesAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = diseaseListQuerySchema.parse(req.query);
    const result = await diseaseService.listDiseases(query);
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function createDiseaseHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createDiseaseSchema.parse(req.body);
    const doc = await diseaseService.createDisease(input, req.user?.id);
    res.status(201).json(ok(doc));
  } catch (err) {
    next(err);
  }
}

export async function updateDiseaseHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const key = req.params.key as string;
    const input = updateDiseaseSchema.parse(req.body);
    const doc = await diseaseService.updateDisease(key, input);
    res.json(ok(doc));
  } catch (err) {
    next(err);
  }
}
