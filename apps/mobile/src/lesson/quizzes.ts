// Quiz questions for the runner's quiz step (T-044). Shape mirrors the `questions` document in
// docs/03_DATA_MODEL.md: { quizKey, prompt{ar,fr?,en?}, options[{termKey?|text?, correct}],
// explanation{ar,fr?,en?} }. An option prefers a `termKey` so FR/EN resolve from the `terms`
// collection (docs/03) — here it resolves against the local HEART_TERMS seam (viewer/hotspots.ts)
// until the terms API is wired (T-013). Same drop-in seam as hotspots.ts / lessons.ts.
// TODO(NEEDS_REVIEW): unpublishable fixture content — a doctor_reviewer must verify the prompt and
// explanation before this is served as `status: "verified"` (AGENTS content rule).

export interface QuizText {
  ar: string;
  fr: string;
  en: string;
}

export interface QuizOption {
  /** Prefer a term reference so FR/EN come from `terms` (docs/03). */
  termKey?: string;
  /** Inline label when there is no term to reference (mutually exclusive with `termKey`). */
  text?: QuizText;
  correct: boolean;
}

export interface QuizQuestion {
  quizKey: string;
  prompt: QuizText;
  options: QuizOption[];
  explanation: QuizText;
}

// Keyed by `quizKey`; a lesson's quiz step references one by `quizId` (docs/03). One question is
// enough for the flow — a lesson's quiz step is a single question, not a scored set.
export const QUIZ_QUESTIONS: Record<string, QuizQuestion> = {
  heart_lv: {
    quizKey: 'heart_lv',
    prompt: {
      ar: 'أي حجرة تضخ الدم المؤكسج إلى الجسم كله؟',
      fr: 'Quelle cavité propulse le sang oxygéné vers tout le corps ?',
      en: 'Which chamber pumps oxygenated blood to the whole body?',
    },
    options: [
      { termKey: 'right_atrium', correct: false },
      { termKey: 'left_ventricle', correct: true },
      { termKey: 'left_atrium', correct: false },
    ],
    explanation: {
      ar: 'البطين الأيسر عضلته أسمك لأنه يضخ الدم المؤكسج إلى الجسم كله.',
      fr: 'Le ventricule gauche a une paroi plus épaisse car il propulse le sang oxygéné vers tout le corps.',
      en: 'The left ventricle has a thicker wall because it pumps oxygenated blood to the whole body.',
    },
  },
};
