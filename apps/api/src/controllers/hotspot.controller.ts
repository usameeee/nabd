import type { NextFunction, Request, Response } from 'express';
import { createHotspotSchema, hotspotListQuerySchema, updateHotspotSchema } from '@nabd/shared';
import * as hotspotService from '../services/hotspot.service';
import { ok } from '../utils/response';

// Public: the viewer reads a model's hotspots by `?modelKey=`. Hotspots carry no status of their
// own — visibility follows the model's own gate (docs/02).
export async function listHotspotsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = hotspotListQuerySchema.parse(req.query);
    const result = await hotspotService.listHotspots(query);
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function createHotspotHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createHotspotSchema.parse(req.body);
    const doc = await hotspotService.createHotspot(input);
    res.status(201).json(ok(doc));
  } catch (err) {
    next(err);
  }
}

export async function updateHotspotHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const input = updateHotspotSchema.parse(req.body);
    const doc = await hotspotService.updateHotspot(id, input);
    res.json(ok(doc));
  } catch (err) {
    next(err);
  }
}

export async function deleteHotspotHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const doc = await hotspotService.deleteHotspot(id);
    res.json(ok(doc));
  } catch (err) {
    next(err);
  }
}
