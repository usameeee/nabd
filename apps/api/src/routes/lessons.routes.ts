import { Router } from 'express';
import {
  createLessonHandler,
  getLessonHandler,
  listLessonsAdminHandler,
  listLessonsHandler,
  updateLessonHandler,
} from '../controllers/lesson.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export const lessonsRouter = Router();

// Lessons are learning content: editors/admin author them; doctor reviewers can read drafts.
const MANAGERS = ['editor', 'doctor_reviewer', 'admin'] as const;
const WRITERS = ['editor', 'admin'] as const;

// Student-facing reads — verified lessons only.
lessonsRouter.get('/', listLessonsHandler);

// Editors see everything, including drafts. Registered before `/:key`.
lessonsRouter.get('/manage', authenticate, requireRole(...MANAGERS), listLessonsAdminHandler);

lessonsRouter.post('/', authenticate, requireRole(...WRITERS), createLessonHandler);

lessonsRouter.get('/:key', getLessonHandler);
lessonsRouter.patch('/:key', authenticate, requireRole(...WRITERS), updateLessonHandler);
