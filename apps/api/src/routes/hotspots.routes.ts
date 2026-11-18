import { Router } from 'express';
import {
  createHotspotHandler,
  deleteHotspotHandler,
  listHotspotsHandler,
  updateHotspotHandler,
} from '../controllers/hotspot.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export const hotspotsRouter = Router();

const WRITERS = ['editor', 'admin'] as const;

// Public read, scoped with `?modelKey=` so the viewer can fetch a model's points (docs/02).
hotspotsRouter.get('/', listHotspotsHandler);

hotspotsRouter.post('/', authenticate, requireRole(...WRITERS), createHotspotHandler);
hotspotsRouter.patch('/:id', authenticate, requireRole(...WRITERS), updateHotspotHandler);
hotspotsRouter.delete('/:id', authenticate, requireRole(...WRITERS), deleteHotspotHandler);
