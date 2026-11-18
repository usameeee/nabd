import { Router } from 'express';
import {
  createModelHandler,
  getModelHandler,
  listModelsAdminHandler,
  listModelsHandler,
  updateModelHandler,
} from '../controllers/model.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export const modelsRouter = Router();

// Model files are content assets: editors/admin author them; doctor reviewers can read drafts.
const MANAGERS = ['editor', 'doctor_reviewer', 'admin'] as const;
const WRITERS = ['editor', 'admin'] as const;

// Student-facing reads — verified models only.
modelsRouter.get('/', listModelsHandler);

// Editors see everything, including drafts. Registered before `/:key`.
modelsRouter.get('/manage', authenticate, requireRole(...MANAGERS), listModelsAdminHandler);

modelsRouter.post('/', authenticate, requireRole(...WRITERS), createModelHandler);

modelsRouter.get('/:key', getModelHandler);
modelsRouter.patch('/:key', authenticate, requireRole(...WRITERS), updateModelHandler);
