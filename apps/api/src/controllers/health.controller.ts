import type { Request, Response } from 'express';
import { ok } from '../utils/response';

export function getHealth(_req: Request, res: Response): void {
  res.json(ok({ status: 'up', uptime: process.uptime() }));
}
