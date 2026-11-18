// The lesson the runner plays (T-043). Static, like hotspots.ts / layers.ts / diseases.ts: the
// fixture's structure mirrors the `lessons` collection in docs/03_DATA_MODEL.md
// ({ key, title, unit, steps[], termKeys }), but the step DISPLAY text lives here because the
// API stores only refs (modelKey/hotspotIds/diseaseKey/videoId/caseId/quizId) and resolves the
// rest at read time. Swapping in `GET /lessons` is a drop-in change once the DB is wired (T-013).
// TODO(NEEDS_REVIEW): this is unpublishable fixture content — a doctor_reviewer must verify it
// (and the step texts) before any lesson is served as `status: "verified"`.

interface LessonText {
  ar: string;
  fr: string;
  en: string;
}

// One screen of the runner. The `type` values are the shared `LESSON_STEP_TYPES`; the payload is
// the display content for that type (the quiz payload is filled in by T-044).
export type RunnerStep =
  | { type: 'explain'; title: LessonText; body: LessonText; xp: number }
  | { type: 'viewer'; title: LessonText; modelKey: string; xp: number }
  | { type: 'video'; title: LessonText; videoId: string; xp: number }
  | { type: 'case'; title: LessonText; body: LessonText; caseId: string; xp: number }
  | { type: 'quiz'; quizId: string; xp: number };

export interface RunnerLesson {
  key: string;
  title: LessonText;
  unit: string;
  steps: RunnerStep[];
  /** Terms unlocked by finishing the lesson — references, never copied text (docs/03). */
  termKeys: string[];
}

export const HEART_LESSON: RunnerLesson = {
  key: 'heart_circulation',
  title: {
    ar: 'القلب والدورة الدموية',
    fr: 'Cœur et circulation',
    en: 'Heart and circulation',
  },
  unit: 'cardiology',
  steps: [
    {
      type: 'explain',
      xp: 5,
      title: { ar: 'القلب عضلة', fr: 'Le cœur, un muscle', en: 'The heart is a muscle' },
      body: {
        ar: 'القلب مضخة عضلية بأربع حجرات: أذينان وبطينان. يدفع الدم في دورتين: الدورة الرئوية ثم الدورة الجهازية.',
        fr: 'Le cœur est une pompe musculaire à quatre cavités : deux oreillettes et deux ventricules. Il propulse le sang dans la circulation pulmonaire puis systémique.',
        en: 'The heart is a muscular pump with four chambers: two atria and two ventricles. It drives blood through the pulmonary then the systemic circulation.',
      },
    },
    {
      type: 'viewer',
      xp: 10,
      modelKey: 'heart',
      title: { ar: 'القلب ثلاثي الأبعاد', fr: 'Cœur en 3D', en: 'Heart in 3D' },
    },
    {
      type: 'video',
      xp: 5,
      videoId: 'heart_intro',
      title: { ar: 'مقدمة مختصرة', fr: 'Introduction courte', en: 'A short introduction' },
    },
    {
      type: 'case',
      xp: 10,
      caseId: 'chest_pain_case',
      title: {
        ar: 'حالة سريرية: ألم في الصدر',
        fr: 'Cas clinique : douleur thoracique',
        en: 'Clinical case: chest pain',
      },
      body: {
        ar: 'رجل في الخمسين يشكو من ألم ضاغط في الصدر ينتشر إلى الذراع اليسرى.',
        fr: 'Un homme d’une cinquantaine d’années présente une douleur thoracique constrictive irradiant vers le bras gauche.',
        en: 'A man in his fifties has constricting chest pain radiating to the left arm.',
      },
    },
    {
      type: 'quiz',
      xp: 20,
      quizId: 'heart_lv',
    },
  ],
  termKeys: ['right_atrium', 'left_atrium', 'right_ventricle', 'left_ventricle'],
};
