import { useState, type FormEvent } from 'react';
import {
  DISEASE_STATUSES,
  type DiseaseStage,
  type DiseaseStatus,
  type DiseaseVisual,
} from '@nabd/shared';
import { ApiError } from '../api/client';
import { createDisease, updateDisease, type Disease, type DiseaseInput } from '../api/diseases';
import { admin, diseaseStatusLabel } from '../i18n';

// A stage as edited in the form — numbers and lists are held as strings and parsed on submit.
interface StageState {
  key: string;
  labelTermKey: string;
  highlightMeshes: string;
  vesselNarrowing: string;
  materialOverrides: string;
}

interface FormState {
  key: string;
  termKey: string;
  modelKey: string;
  icd11Code: string;
  icd11Uri: string;
  symptoms: string;
  videos: string;
  quizId: string;
  status: DiseaseStatus;
  stages: StageState[];
}

const EMPTY_STAGE: StageState = {
  key: '',
  labelTermKey: '',
  highlightMeshes: '',
  vesselNarrowing: '',
  materialOverrides: '',
};

function stageToState(stage: DiseaseStage): StageState {
  return {
    key: stage.key,
    labelTermKey: stage.labelTermKey ?? '',
    highlightMeshes: (stage.visual.highlightMeshes ?? []).join(', '),
    vesselNarrowing:
      stage.visual.vesselNarrowing !== undefined ? String(stage.visual.vesselNarrowing) : '',
    materialOverrides: stage.visual.materialOverrides
      ? JSON.stringify(stage.visual.materialOverrides)
      : '',
  };
}

function toFormState(disease: Disease | null): FormState {
  if (!disease) {
    return {
      key: '',
      termKey: '',
      modelKey: '',
      icd11Code: '',
      icd11Uri: '',
      symptoms: '',
      videos: '',
      quizId: '',
      status: 'draft',
      stages: [],
    };
  }
  return {
    key: disease.key,
    termKey: disease.termKey,
    modelKey: disease.modelKey,
    icd11Code: disease.icd11?.code ?? '',
    icd11Uri: disease.icd11?.uri ?? '',
    symptoms: disease.symptomTermKeys.join(', '),
    videos: (disease.videoIds ?? []).join(', '),
    quizId: disease.quizId ?? '',
    status: disease.status,
    stages: disease.stages.map(stageToState),
  };
}

// Comma-separated input → trimmed, non-empty list.
function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

// A stage row → the API shape. Throws on malformed JSON so the dialog can show the error.
function toStage(state: StageState): DiseaseStage {
  const visual: DiseaseVisual = {};
  const highlightMeshes = splitList(state.highlightMeshes);
  if (highlightMeshes.length > 0) visual.highlightMeshes = highlightMeshes;
  if (state.vesselNarrowing.trim() !== '') {
    visual.vesselNarrowing = Number(state.vesselNarrowing);
  }
  if (state.materialOverrides.trim() !== '') {
    visual.materialOverrides = JSON.parse(state.materialOverrides) as Record<string, unknown>;
  }
  return {
    key: state.key.trim(),
    ...(state.labelTermKey.trim() ? { labelTermKey: state.labelTermKey.trim() } : {}),
    visual,
  };
}

interface DiseaseFormDialogProps {
  disease: Disease | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

// Create/edit dialog for a disease. Stages are a list of visual recipes applied to the SAME
// model (docs/03) — the viewer eases between them (T-041). The API validates everything (zod).
export function DiseaseFormDialog({ disease, token, onClose, onSaved }: DiseaseFormDialogProps) {
  const strings = admin.diseases;
  const isEdit = disease !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(disease));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateStage(index: number, field: keyof StageState, value: string) {
    setForm((prev) => ({
      ...prev,
      stages: prev.stages.map((stage, i) => (i === index ? { ...stage, [field]: value } : stage)),
    }));
  }

  function addStage() {
    setForm((prev) => ({ ...prev, stages: [...prev.stages, { ...EMPTY_STAGE }] }));
  }

  function removeStage(index: number) {
    setForm((prev) => ({ ...prev, stages: prev.stages.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    let input: DiseaseInput;
    try {
      input = {
        termKey: form.termKey.trim(),
        modelKey: form.modelKey.trim(),
        icd11:
          form.icd11Code.trim() || form.icd11Uri.trim()
            ? {
                ...(form.icd11Code.trim() ? { code: form.icd11Code.trim() } : {}),
                ...(form.icd11Uri.trim() ? { uri: form.icd11Uri.trim() } : {}),
              }
            : undefined,
        stages: form.stages.map(toStage),
        symptomTermKeys: splitList(form.symptoms),
        videoIds: splitList(form.videos),
        quizId: form.quizId.trim() || undefined,
        status: form.status,
        ...(isEdit ? {} : { key: form.key.trim() }),
      };
    } catch {
      setError(strings.error);
      setSaving(false);
      return;
    }

    try {
      if (isEdit) {
        await updateDisease(form.key, input, token);
      } else {
        await createDisease(input, token);
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
            <span className="field__label">{strings.termKey}</span>
            <input
              className="field__input field__input--mono"
              required
              value={form.termKey}
              onChange={(event) => update('termKey', event.target.value)}
            />
            <span className="field__hint">{strings.termKeyHint}</span>
          </label>

          <label className="field">
            <span className="field__label">{strings.modelKey}</span>
            <input
              className="field__input field__input--mono"
              required
              value={form.modelKey}
              onChange={(event) => update('modelKey', event.target.value)}
            />
            <span className="field__hint">{strings.modelKeyHint}</span>
          </label>

          <label className="field">
            <span className="field__label">
              {strings.icd11Code} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input field__input--mono"
              value={form.icd11Code}
              onChange={(event) => update('icd11Code', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">
              {strings.icd11Uri} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input field__input--mono"
              value={form.icd11Uri}
              onChange={(event) => update('icd11Uri', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.status}</span>
            <select
              className="field__input"
              value={form.status}
              onChange={(event) => update('status', event.target.value as DiseaseStatus)}
            >
              {DISEASE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {diseaseStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field__label">{strings.symptoms}</span>
          <input
            className="field__input field__input--mono"
            value={form.symptoms}
            onChange={(event) => update('symptoms', event.target.value)}
          />
          <span className="field__hint">{strings.symptomsHint}</span>
        </label>

        <fieldset className="fieldset">
          <legend className="field__label">{strings.stages}</legend>
          {form.stages.length === 0 ? (
            <p className="card__muted">{strings.noStages}</p>
          ) : (
            form.stages.map((stage, index) => (
              // Stage rows are positional; keying by index keeps focus stable while typing.
              <fieldset className="fieldset" key={index}>
                <div className="dialog__grid">
                  <label className="field">
                    <span className="field__label">{strings.stageKey}</span>
                    <input
                      className="field__input field__input--mono"
                      required
                      value={stage.key}
                      onChange={(event) => updateStage(index, 'key', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">
                      {strings.stageLabelTermKey}{' '}
                      <span className="field__hint">({strings.optional})</span>
                    </span>
                    <input
                      className="field__input field__input--mono"
                      value={stage.labelTermKey}
                      onChange={(event) => updateStage(index, 'labelTermKey', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">{strings.vesselNarrowing}</span>
                    <input
                      className="field__input"
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={stage.vesselNarrowing}
                      onChange={(event) => updateStage(index, 'vesselNarrowing', event.target.value)}
                    />
                  </label>
                </div>

                <label className="field">
                  <span className="field__label">{strings.highlightMeshes}</span>
                  <input
                    className="field__input field__input--mono"
                    value={stage.highlightMeshes}
                    onChange={(event) => updateStage(index, 'highlightMeshes', event.target.value)}
                  />
                </label>

                <label className="field">
                  <span className="field__label">{strings.materialOverrides}</span>
                  <textarea
                    className="field__input field__input--mono"
                    rows={3}
                    value={stage.materialOverrides}
                    onChange={(event) => updateStage(index, 'materialOverrides', event.target.value)}
                  />
                  <span className="field__hint">{strings.materialOverridesHint}</span>
                </label>

                <div className="dialog__actions">
                  <button
                    className="button button--danger"
                    type="button"
                    onClick={() => removeStage(index)}
                  >
                    {strings.removeStage}
                  </button>
                </div>
              </fieldset>
            ))
          )}
          <div>
            <button className="button button--secondary" type="button" onClick={addStage}>
              {strings.addStage}
            </button>
          </div>
        </fieldset>

        <label className="field">
          <span className="field__label">
            {strings.videos} <span className="field__hint">({strings.optional})</span>
          </span>
          <input
            className="field__input field__input--mono"
            value={form.videos}
            onChange={(event) => update('videos', event.target.value)}
          />
          <span className="field__hint">{strings.videosHint}</span>
        </label>

        <label className="field">
          <span className="field__label">
            {strings.quizId} <span className="field__hint">({strings.optional})</span>
          </span>
          <input
            className="field__input field__input--mono"
            value={form.quizId}
            onChange={(event) => update('quizId', event.target.value)}
          />
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
