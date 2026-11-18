import { useState, type FormEvent } from 'react';
import {
  LESSON_STATUSES,
  LESSON_STEP_TYPES,
  type LessonStep,
  type LessonStepRef,
  type LessonStepType,
  type LessonStatus,
} from '@nabd/shared';
import { ApiError } from '../api/client';
import { createLesson, updateLesson, type Lesson, type LessonInput } from '../api/lessons';
import { admin, lessonStatusLabel, stepTypeLabel } from '../i18n';

// A step as edited in the form — numbers and lists are held as strings and parsed on submit.
interface StepState {
  type: LessonStepType;
  xp: string;
  modelKey: string;
  diseaseKey: string;
  hotspotIds: string;
  videoId: string;
  caseId: string;
  quizId: string;
}

interface FormState {
  key: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  unit: string;
  order: string;
  faculty: string;
  year: string;
  termKeys: string;
  status: LessonStatus;
  steps: StepState[];
}

const EMPTY_STEP: StepState = {
  type: 'explain',
  xp: '0',
  modelKey: '',
  diseaseKey: '',
  hotspotIds: '',
  videoId: '',
  caseId: '',
  quizId: '',
};

function stepToState(step: LessonStep): StepState {
  return {
    type: step.type,
    xp: String(step.xp),
    modelKey: step.ref.modelKey ?? '',
    diseaseKey: step.ref.diseaseKey ?? '',
    hotspotIds: (step.ref.hotspotIds ?? []).join(', '),
    videoId: step.ref.videoId ?? '',
    caseId: step.ref.caseId ?? '',
    quizId: step.ref.quizId ?? '',
  };
}

function toFormState(lesson: Lesson | null): FormState {
  if (!lesson) {
    return {
      key: '',
      titleAr: '',
      titleFr: '',
      titleEn: '',
      unit: '',
      order: '1',
      faculty: '',
      year: '',
      termKeys: '',
      status: 'draft',
      steps: [],
    };
  }
  return {
    key: lesson.key,
    titleAr: lesson.title.ar,
    titleFr: lesson.title.fr ?? '',
    titleEn: lesson.title.en ?? '',
    unit: lesson.unit,
    order: String(lesson.order),
    faculty: lesson.faculty ?? '',
    year: lesson.year !== undefined ? String(lesson.year) : '',
    termKeys: lesson.termKeys.join(', '),
    status: lesson.status,
    steps: lesson.steps.map(stepToState),
  };
}

// Comma-separated input → trimmed, non-empty list.
function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

// A step row → the API shape: only the ref fields that were filled are sent (docs/03 → steps[].ref).
function toStep(state: StepState): LessonStep {
  const ref: LessonStepRef = {};
  if (state.modelKey.trim()) ref.modelKey = state.modelKey.trim();
  const hotspotIds = splitList(state.hotspotIds);
  if (hotspotIds.length > 0) ref.hotspotIds = hotspotIds;
  if (state.diseaseKey.trim()) ref.diseaseKey = state.diseaseKey.trim();
  if (state.videoId.trim()) ref.videoId = state.videoId.trim();
  if (state.caseId.trim()) ref.caseId = state.caseId.trim();
  if (state.quizId.trim()) ref.quizId = state.quizId.trim();
  return { type: state.type, ref, xp: state.xp.trim() ? Number(state.xp) : 0 };
}

interface LessonFormDialogProps {
  lesson: Lesson | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

// Create/edit dialog for a lesson. Steps are an ordered list of the runner's screens (T-043) —
// each points at existing content by key/id (docs/03). The API validates everything (zod).
export function LessonFormDialog({ lesson, token, onClose, onSaved }: LessonFormDialogProps) {
  const strings = admin.lessons;
  const isEdit = lesson !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(lesson));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateStep(index: number, field: keyof StepState, value: string) {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? { ...step, [field]: value } : step)),
    }));
  }

  function addStep() {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, { ...EMPTY_STEP }] }));
  }

  function removeStep(index: number) {
    setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const input: LessonInput = {
      title: {
        ar: form.titleAr.trim(),
        ...(form.titleFr.trim() ? { fr: form.titleFr.trim() } : {}),
        ...(form.titleEn.trim() ? { en: form.titleEn.trim() } : {}),
      },
      unit: form.unit.trim(),
      order: Number(form.order),
      faculty: form.faculty.trim() || undefined,
      year: form.year.trim() ? Number(form.year) : undefined,
      steps: form.steps.map(toStep),
      termKeys: splitList(form.termKeys),
      status: form.status,
      ...(isEdit ? {} : { key: form.key.trim() }),
    };

    try {
      if (isEdit) {
        await updateLesson(form.key, input, token);
      } else {
        await createLesson(input, token);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dialog" role="dialog" aria-modal="true">
      <form className="dialog__card" onSubmit={handleSubmit}>
        <h2 className="dialog__title">{isEdit ? strings.editTitle : strings.createTitle}</h2>

        <div className="dialog__grid">
          <label className="field">
            <span className="field__label">{strings.key}</span>
            <input
              className="field__input field__input--mono"
              required
              disabled={isEdit}
              value={form.key}
              onChange={(event) => update('key', event.target.value)}
            />
            {isEdit ? null : <span className="field__hint">{strings.keyHint}</span>}
          </label>

          <label className="field">
            <span className="field__label">{strings.titleAr}</span>
            <input
              className="field__input"
              required
              value={form.titleAr}
              onChange={(event) => update('titleAr', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">
              {strings.titleFr} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input"
              value={form.titleFr}
              onChange={(event) => update('titleFr', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">
              {strings.titleEn} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input"
              value={form.titleEn}
              onChange={(event) => update('titleEn', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.unit}</span>
            <input
              className="field__input field__input--mono"
              required
              value={form.unit}
              onChange={(event) => update('unit', event.target.value)}
            />
            <span className="field__hint">{strings.unitHint}</span>
          </label>

          <label className="field">
            <span className="field__label">{strings.order}</span>
            <input
              className="field__input"
              type="number"
              min="0"
              required
              value={form.order}
              onChange={(event) => update('order', event.target.value)}
            />
            <span className="field__hint">{strings.orderHint}</span>
          </label>

          <label className="field">
            <span className="field__label">
              {strings.faculty} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input"
              value={form.faculty}
              onChange={(event) => update('faculty', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">
              {strings.year} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input"
              type="number"
              min="1"
              value={form.year}
              onChange={(event) => update('year', event.target.value)}
            />
            <span className="field__hint">{strings.yearHint}</span>
          </label>

          <label className="field">
            <span className="field__label">{strings.status}</span>
            <select
              className="field__input"
              value={form.status}
              onChange={(event) => update('status', event.target.value as LessonStatus)}
            >
              {LESSON_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {lessonStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="fieldset">
          <legend className="field__label">{strings.steps}</legend>
          {form.steps.length === 0 ? (
            <p className="card__muted">{strings.noSteps}</p>
          ) : (
            form.steps.map((step, index) => (
              // Step rows are positional; keying by index keeps focus stable while typing.
              <fieldset className="fieldset" key={index}>
                <div className="dialog__grid">
                  <label className="field">
                    <span className="field__label">{strings.stepType}</span>
                    <select
                      className="field__input"
                      value={step.type}
                      onChange={(event) => updateStep(index, 'type', event.target.value)}
                    >
                      {LESSON_STEP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {stepTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field__label">{strings.stepXp}</span>
                    <input
                      className="field__input"
                      type="number"
                      min="0"
                      value={step.xp}
                      onChange={(event) => updateStep(index, 'xp', event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {strings.refModelKey} <span className="field__hint">({strings.optional})</span>
                    </span>
                    <input
                      className="field__input field__input--mono"
                      value={step.modelKey}
                      onChange={(event) => updateStep(index, 'modelKey', event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {strings.refDiseaseKey}{' '}
                      <span className="field__hint">({strings.optional})</span>
                    </span>
                    <input
                      className="field__input field__input--mono"
                      value={step.diseaseKey}
                      onChange={(event) => updateStep(index, 'diseaseKey', event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {strings.refVideoId} <span className="field__hint">({strings.optional})</span>
                    </span>
                    <input
                      className="field__input field__input--mono"
                      value={step.videoId}
                      onChange={(event) => updateStep(index, 'videoId', event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {strings.refCaseId} <span className="field__hint">({strings.optional})</span>
                    </span>
                    <input
                      className="field__input field__input--mono"
                      value={step.caseId}
                      onChange={(event) => updateStep(index, 'caseId', event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {strings.refQuizId} <span className="field__hint">({strings.optional})</span>
                    </span>
                    <input
                      className="field__input field__input--mono"
                      value={step.quizId}
                      onChange={(event) => updateStep(index, 'quizId', event.target.value)}
                    />
                  </label>
                </div>

                <label className="field">
                  <span className="field__label">
                    {strings.refHotspotIds}{' '}
                    <span className="field__hint">({strings.optional})</span>
                  </span>
                  <input
                    className="field__input field__input--mono"
                    value={step.hotspotIds}
                    onChange={(event) => updateStep(index, 'hotspotIds', event.target.value)}
                  />
                </label>

                <div className="dialog__actions">
                  <button
                    className="button button--danger"
                    type="button"
                    onClick={() => removeStep(index)}
                  >
                    {strings.removeStep}
                  </button>
                </div>
              </fieldset>
            ))
          )}
          <div>
            <button className="button button--secondary" type="button" onClick={addStep}>
              {strings.addStep}
            </button>
          </div>
        </fieldset>

        <label className="field">
          <span className="field__label">{strings.termKeys}</span>
          <input
            className="field__input field__input--mono"
            value={form.termKeys}
            onChange={(event) => update('termKeys', event.target.value)}
          />
          <span className="field__hint">{strings.termKeysHint}</span>
        </label>

        {error ? (
          <p className="field__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="dialog__actions">
          <button className="button button--secondary" type="button" onClick={onClose}>
            {strings.cancel}
          </button>
          <button className="button button--primary" type="submit" disabled={saving}>
            {saving ? strings.saving : strings.save}
          </button>
        </div>
      </form>
    </div>
  );
}
