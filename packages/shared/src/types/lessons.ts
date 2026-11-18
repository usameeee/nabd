// Lesson enums + shapes shared by API and admin (see docs/03_DATA_MODEL.md → lessons).
export const LESSON_STATUSES = ['draft', 'needs_review', 'verified'] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

// A lesson step is one screen in the runner (T-043): explain text, a 3D viewer, a video,
// a clinical case or a quiz question.
export const LESSON_STEP_TYPES = ['explain', 'viewer', 'video', 'case', 'quiz'] as const;
export type LessonStepType = (typeof LESSON_STEP_TYPES)[number];

// Arabic is primary; FR/EN are switchable layers (docs/01). Lesson titles are authored here
// (they are not term references), so all three live on the lesson document.
export interface LocalizedText {
  ar: string;
  fr?: string;
  en?: string;
}

// What a step points at (docs/03). Every field is optional — the step type decides which
// one matters. `hotspotIds` hold hotspot `_id`s, so they are plain strings (not term keys).
export interface LessonStepRef {
  modelKey?: string;
  hotspotIds?: string[];
  diseaseKey?: string;
  videoId?: string;
  caseId?: string;
  quizId?: string;
}

// One step of a lesson, with the XP it awards (docs/03).
export interface LessonStep {
  type: LessonStepType;
  ref: LessonStepRef;
  xp: number;
}
