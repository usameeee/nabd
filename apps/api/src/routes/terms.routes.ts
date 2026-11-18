import { Router } from 'express';
import {
  createTermHandler,
  getTermHandler,
  getTermStatsHandler,
  listTermsAdminHandler,
  listTermsHandler,
  updateTermHandler,
} from '../controllers/term.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export const termsRouter = Router();

const CONTRIBUTORS = ['editor', 'translator', 'doctor_reviewer', 'admin'] as const;
const AUTHORS = ['editor', 'translator', 'admin'] as const;

// Student-facing reads — verified content only.
termsRouter.get('/', listTermsHandler);

// Editors see everything, including drafts. Registered before `/:key`.
termsRouter.get('/manage', authenticate, requireRole(...CONTRIBUTORS), listTermsAdminHandler);
termsRouter.get('/stats', authenticate, requireRole(...CONTRIBUTORS), getTermStatsHandler);

termsRouter.post('/', authenticate, requireRole(...AUTHORS), createTermHandler);

termsRouter.get('/:key', getTermHandler);
termsRouter.patch('/:key', authenticate, requireRole(...CONTRIBUTORS), updateTermHandler);
