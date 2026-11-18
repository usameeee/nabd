import type { NextFunction, Request, Response } from 'express';
import { createModelSchema, modelListQuerySchema, updateModelSchema } from '@nabd/shared';
import * as modelService from '../services/model.service';
import { ok } from '../utils/response';

// Student-facing: only `status: "verified"` models are returned.
export async function listModelsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = modelListQuerySchema.parse(req.query);
    const result = await modelService.listModels(query, { onlyVerified: true });
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function getModelHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const key = req.params.key as string;
    const doc = await modelService.getModelByKey(key, { onlyVerified: true });
    res.json(ok(doc));
  } catch (err) {
    next(err);
  }
}

// Editor / doctor reviewer / admin: full list including drafts.
export async function listModelsAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = modelListQuerySchema.parse(req.query);
    const result = await modelService.listModels(query);
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function createModelHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createModelSchema.parse(req.body);
    const doc = await modelService.createModel(input, req.user?.id);
    res.status(201).json(ok(doc));
  } catch (err) {
    next(err);
  }
}

export async function updateModelHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const key = req.params.key as string;
    const input = updateModelSchema.parse(req.body);
    const doc = await modelService.updateModel(key, input);
    res.json(ok(doc));
  } catch (err) {
    next(err);
  }
}
