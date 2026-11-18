import type { NextFunction, Request, Response } from 'express';
import { createLessonSchema, lessonListQuerySchema, updateLessonSchema } from '@nabd/shared';
import * as lessonService from '../services/lesson.service';
import { ok } from '../utils/response';

// Student-facing: only `status: "verified"` lessons are returned.
export async function listLessonsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = lessonListQuerySchema.parse(req.query);
    const result = await lessonService.listLessons(query, { onlyVerified: true });
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function getLessonHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const key = req.params.key as string;
    const doc = await lessonService.getLessonByKey(key, { onlyVerified: true });
    res.json(ok(doc));
  } catch (err) {
    next(err);
  }
}

// Editor / doctor reviewer / admin: full list including drafts.
export async function listLessonsAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = lessonListQuerySchema.parse(req.query);
    const result = await lessonService.listLessons(query);
    res.json(ok(result));
  } catch (err) {
    next(err);
  }
}

export async function createLessonHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createLessonSchema.parse(req.body);
    const doc = await lessonService.createLesson(input, req.user?.id);
    res.status(201).json(ok(doc));
  } catch (err) {
    next(err);
  }
}

export async function updateLessonHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const key = req.params.key as string;
    const input = updateLessonSchema.parse(req.body);
    const doc = await lessonService.updateLesson(key, input);
    res.json(ok(doc));
  } catch (err) {
    next(err);
  }
}
