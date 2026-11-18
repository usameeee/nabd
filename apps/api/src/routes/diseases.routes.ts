import { Router } from 'express';
import {
  createDiseaseHandler,
  getDiseaseHandler,
  listDiseasesAdminHandler,
  listDiseasesHandler,
  updateDiseaseHandler,
} from '../controllers/disease.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export const diseasesRouter = Router();

// Diseases are medical content: editors/admin author them; doctor reviewers can read drafts.
const MANAGERS = ['editor', 'doctor_reviewer', 'admin'] as const;
const WRITERS = ['editor', 'admin'] as const;

// Student-facing reads — verified diseases only.
diseasesRouter.get('/', listDiseasesHandler);

// Editors see everything, including drafts. Registered before `/:key`.
diseasesRouter.get('/manage', authenticate, requireRole(...MANAGERS), listDiseasesAdminHandler);

diseasesRouter.post('/', authenticate, requireRole(...WRITERS), createDiseaseHandler);

diseasesRouter.get('/:key', getDiseaseHandler);
diseasesRouter.patch('/:key', authenticate, requireRole(...WRITERS), updateDiseaseHandler);
