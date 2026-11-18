import AsyncStorage from '@react-native-async-storage/async-storage';

// Device-local stand-in for the docs/03 `progress` + `streaks` + `termCollection` collections (T-045,
// extended by T-046). There is no DB/session yet (T-013): like hotspots.ts/lessons.ts this is the
// drop-in seam, but it PERSISTS (AsyncStorage, the same store the locale uses) so XP / streak /
// collection survive a reload. When the API + auth exist, these reads/writes move behind
// `GET/POST /progress` — the shapes below mirror docs/03 exactly, so nothing else has to change.

const STORAGE_KEY = 'nabd.progress.v1';

// docs/03 `progress` — one row per lesson the student has touched.
export interface LessonProgress {
  lessonKey: string;
  stepIndex: number;
  completed: boolean;
  xp: number;
}

// docs/03 `termCollection` — one row per collected term, on a Leitner schedule of boxes 1-5.
export interface TermReview {
  termKey: string;
  /** 1..5. A correct review moves it up a box; a wrong one drops it back to 1. */
  box: number;
  /** Local `YYYY-MM-DD` day key: the day the term becomes due for review again. */
  nextReviewAt: string;
  correctCount: number;
  wrongCount: number;
}

/** Leitner boxes run 1..5 (docs/03 termCollection `box: 1..5`). */
export const MAX_BOX = 5;
// Days until a term is due again, per box. Box 1 is due immediately (today) so a freshly collected /
// just-missed term comes back in the same sitting; the gaps widen as the term is recalled.
const BOX_INTERVAL_DAYS: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  /** docs/03 `streaks`. `lastActiveDate` is a local `YYYY-MM-DD` day key (a streak counts days). */
  streak: { current: number; best: number; lastActiveDate: string | null };
  /** docs/03 `termCollection` — collected terms keyed by `termKey` (T-046). */
  terms: Record<string, TermReview>;
}

const EMPTY: ProgressState = {
  lessons: {},
  streak: { current: 0, best: 0, lastActiveDate: null },
  terms: {},
};

// Local day key (the streak counts calendar days, not 24h windows).
function dayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Whole days between two day keys.
function dayGap(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

// A freshly collected term starts in box 1, due the same day.
function newTerm(termKey: string, today: string): TermReview {
  return { termKey, box: 1, nextReviewAt: today, correctCount: 0, wrongCount: 0 };
}

// v1 stored `terms` as a plain string[]; migrate any legacy array to box-1 rows.
function normalizeTerms(value: unknown): Record<string, TermReview> {
  if (!value) return {};
  if (Array.isArray(value)) {
    const today = dayKey(new Date());
    return Object.fromEntries((value as string[]).map((termKey) => [termKey, newTerm(termKey, today)]));
  }
  return value as Record<string, TermReview>;
}

export async function loadProgress(): Promise<ProgressState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<ProgressState> & { terms?: unknown };
    return { ...EMPTY, ...parsed, terms: normalizeTerms(parsed.terms) };
  } catch {
    return EMPTY;
  }
}

/** Total XP across every lesson — the number Home's pill and the reward screen build on. */
export function totalXp(state: ProgressState): number {
  return Object.values(state.lessons).reduce((sum, lesson) => sum + lesson.xp, 0);
}

/** Term keys that are due for review on or before `now` (docs/03 `nextReviewAt`), soonest first. */
export function dueTermKeys(state: ProgressState, now: Date = new Date()): string[] {
  const today = dayKey(now);
  return Object.values(state.terms)
    .filter((term) => term.nextReviewAt <= today)
    .sort((a, b) => a.box - b.box || a.nextReviewAt.localeCompare(b.nextReviewAt))
    .map((term) => term.termKey);
}

// The numbers the reward screen shows.
export interface RewardSummary {
  /** XP credited for this completion (0 if the lesson was already complete — no double credit). */
  xp: number;
  /** How many new terms this lesson added to the collection. */
  terms: number;
  /** The streak AFTER this completion. */
  streak: number;
}

// Marks a lesson complete, credits its XP, adds its terms and advances the streak.
export async function completeLesson(input: {
  lessonKey: string;
  stepIndex: number;
  xp: number;
  termKeys: string[];
}): Promise<RewardSummary> {
  const state = await loadProgress();
  const today = dayKey(new Date());

  const previous = state.lessons[input.lessonKey];
  const alreadyDone = previous?.completed === true;
  const gained = alreadyDone ? 0 : input.xp;
  state.lessons[input.lessonKey] = {
    lessonKey: input.lessonKey,
    stepIndex: input.stepIndex,
    completed: true,
    xp: (previous?.xp ?? 0) + gained,
  };

  // Add any not-yet-collected term as a fresh box-1 row; existing rows are untouched.
  const before = Object.keys(state.terms).length;
  for (const termKey of input.termKeys) {
    if (!state.terms[termKey]) state.terms[termKey] = newTerm(termKey, today);
  }
  const termsAdded = Object.keys(state.terms).length - before;

  // Same day → unchanged; yesterday → +1; a bigger gap (or first activity) → restart at 1.
  const last = state.streak.lastActiveDate;
  if (last !== today) {
    const next = last && dayGap(last, today) === 1 ? state.streak.current + 1 : 1;
    state.streak = { current: next, best: Math.max(state.streak.best, next), lastActiveDate: today };
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  return { xp: gained, terms: termsAdded, streak: state.streak.current };
}

export interface ReviewOutcome {
  termKey: string;
  /** The box AFTER this answer. */
  box: number;
  /** True once a term has been recalled at the top box. */
  mastered: boolean;
}

// Records a review answer (T-046): correct advances the box (capped at 5), wrong resets to 1.
export async function reviewTerm(termKey: string, correct: boolean): Promise<ReviewOutcome> {
  const state = await loadProgress();
  const today = dayKey(new Date());
  const current = state.terms[termKey] ?? newTerm(termKey, today);
  const box = correct ? Math.min(MAX_BOX, current.box + 1) : 1;

  state.terms[termKey] = {
    termKey,
    box,
    nextReviewAt: addDays(today, BOX_INTERVAL_DAYS[box] ?? 0),
    correctCount: current.correctCount + (correct ? 1 : 0),
    wrongCount: current.wrongCount + (correct ? 0 : 1),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  return { termKey, box, mastered: correct && box === MAX_BOX };
}
