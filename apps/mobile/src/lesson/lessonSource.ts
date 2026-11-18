import { apiGet, isApiConfigured } from '../api/client';
import { readCache, writeCache } from '../offline/cache';
import { HEART_LESSON, type RunnerLesson, type RunnerStep } from './lessons';

// Offline-first lesson loader (T-050). The runner reads through here instead of importing the
// fixture directly: the on-device cache is consulted first, then the API when one is configured
// (`EXPO_PUBLIC_API_URL`), and the bundled fixture is the final fallback — so a lesson always plays,
// online or not. Swapping the fixture for the live `/lessons` response is now a cache concern only.

export type LessonOrigin = 'network' | 'cache' | 'bundled';

export interface LessonResult {
  lesson: RunnerLesson;
  /** Where this copy came from — `bundled` means the device had nothing cached yet. */
  origin: LessonOrigin;
}

const cacheKey = (key: string) => `lesson:${key}`;

// Steps that show text must actually carry it. The API stores refs only (docs/03), so a refs-only
// payload is rejected here and the runner keeps the bundled copy rather than rendering blanks.
function isRunnerStep(value: unknown): value is RunnerStep {
  if (typeof value !== 'object' || value === null) return false;
  const step = value as Record<string, unknown>;
  if (typeof step.type !== 'string' || typeof step.xp !== 'number') return false;
  const showsText = step.type === 'explain' || step.type === 'case' || step.type === 'viewer' || step.type === 'video';
  return showsText ? typeof step.title === 'object' && step.title !== null : true;
}

function isRunnerLesson(value: unknown): value is RunnerLesson {
  if (typeof value !== 'object' || value === null) return false;
  const lesson = value as Record<string, unknown>;
  return (
    typeof lesson.key === 'string' &&
    Array.isArray(lesson.steps) &&
    lesson.steps.length > 0 &&
    lesson.steps.every(isRunnerStep)
  );
}

/** Loads a lesson offline-first: cache → API (when configured) → bundled fixture. */
export async function loadLesson(key: string): Promise<LessonResult> {
  const cached = await readCache<RunnerLesson>(cacheKey(key));
  if (isRunnerLesson(cached)) return { lesson: cached, origin: 'cache' };

  if (isApiConfigured()) {
    const result = await apiGet<unknown>(`/lessons/${key}`);
    if (result.ok && isRunnerLesson(result.data)) {
      await writeCache(cacheKey(key), result.data);
      return { lesson: result.data, origin: 'network' };
    }
  }

  // Seed the cache from the bundled fixture so the next open is instant (and survives a restart).
  await writeCache(cacheKey(HEART_LESSON.key), HEART_LESSON);
  return { lesson: HEART_LESSON, origin: 'bundled' };
}
