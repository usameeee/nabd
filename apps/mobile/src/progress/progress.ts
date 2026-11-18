import AsyncStorage from '@react-native-async-storage/async-storage';

// Device-local stand-in for the docs/03 `progress` + `streaks` + `termCollection` collections (T-045).
// There is no DB/session yet (T-013): like hotspots.ts/lessons.ts this is the drop-in seam, but it
// PERSISTS (AsyncStorage, the same store the locale uses) so XP / streak / collection survive a
// reload. When the API + auth exist, these reads/writes move behind `GET/POST /progress` — the
// shapes below mirror docs/03 exactly, so nothing else has to change.

const STORAGE_KEY = 'nabd.progress.v1';

// docs/03 `progress` — one row per lesson the student has touched.
export interface LessonProgress {
  lessonKey: string;
  stepIndex: number;
  completed: boolean;
  xp: number;
}

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  /** docs/03 `streaks`. `lastActiveDate` is a local `YYYY-MM-DD` day key (a streak counts days). */
  streak: { current: number; best: number; lastActiveDate: string | null };
  /** docs/03 `termCollection` — collected term keys (box / review timing is T-046). */
  terms: string[];
}

const EMPTY: ProgressState = {
  lessons: {},
  streak: { current: 0, best: 0, lastActiveDate: null },
  terms: [],
};

export async function loadProgress(): Promise<ProgressState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY;
  try {
    return { ...EMPTY, ...(JSON.parse(raw) as ProgressState) };
  } catch {
    return EMPTY;
  }
}

/** Total XP across every lesson — the number Home's pill and the reward screen build on. */
export function totalXp(state: ProgressState): number {
  return Object.values(state.lessons).reduce((sum, lesson) => sum + lesson.xp, 0);
}

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

  const before = state.terms.length;
  state.terms = [...new Set([...state.terms, ...input.termKeys])];
  const termsAdded = state.terms.length - before;

  // Same day → unchanged; yesterday → +1; a bigger gap (or first activity) → restart at 1.
  const last = state.streak.lastActiveDate;
  if (last !== today) {
    const next = last && dayGap(last, today) === 1 ? state.streak.current + 1 : 1;
    state.streak = { current: next, best: Math.max(state.streak.best, next), lastActiveDate: today };
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  return { xp: gained, terms: termsAdded, streak: state.streak.current };
}
