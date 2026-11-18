import { useState, type FormEvent } from 'react';
import {
  MODEL_LAYERS,
  MODEL_STATUSES,
  MODEL_SYSTEMS,
  type ModelLayerDef,
  type ModelLayerKey,
  type ModelStatus,
  type ModelSystem,
  type ModelVersion,
} from '@nabd/shared';
import { ApiError } from '../api/client';
import { createModel, updateModel, type Model3D, type ModelInput } from '../api/models';
import { admin, layerLabel, modelStatusLabel } from '../i18n';

interface VersionState {
  url: string;
  sizeBytes: string;
  polyCount: string;
}

interface FormState {
  key: string;
  titleTermKey: string;
  system: ModelSystem;
  light: VersionState;
  detailed: VersionState;
  detailedEnabled: boolean;
  layers: ModelLayerKey[];
  meshNames: Record<string, string>;
  license: string;
  attribution: string;
  sourceUrl: string;
  status: ModelStatus;
}

const EMPTY_VERSION: VersionState = { url: '', sizeBytes: '', polyCount: '' };

function versionState(version: ModelVersion | undefined): VersionState {
  if (!version) return EMPTY_VERSION;
  return {
    url: version.url,
    sizeBytes: String(version.sizeBytes),
    polyCount: String(version.polyCount),
  };
}

function toFormState(model: Model3D | null): FormState {
  if (!model) {
    return {
      key: '',
      titleTermKey: '',
      system: 'other',
      light: EMPTY_VERSION,
      detailed: EMPTY_VERSION,
      detailedEnabled: false,
      layers: [],
      meshNames: {},
      license: '',
      attribution: '',
      sourceUrl: '',
      status: 'draft',
    };
  }
  const meshNames: Record<string, string> = {};
  for (const layer of model.layers) {
    meshNames[layer.key] = layer.meshNames.join(', ');
  }
  return {
    key: model.key,
    titleTermKey: model.titleTermKey,
    system: model.system,
    light: versionState(model.versions.light),
    detailed: versionState(model.versions.detailed),
    detailedEnabled: model.versions.detailed !== undefined,
    layers: model.layers.map((layer) => layer.key),
    meshNames,
    license: model.license,
    attribution: model.attribution,
    sourceUrl: model.sourceUrl,
    status: model.status,
  };
}

function toVersion(state: VersionState): ModelVersion {
  return {
    url: state.url.trim(),
    sizeBytes: Number(state.sizeBytes) || 0,
    polyCount: Number(state.polyCount) || 0,
  };
}

interface ModelFormDialogProps {
  model: Model3D | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

// Create/edit dialog for a model's metadata. Geometry is referenced by external URL
// (docs/02 keeps the API JSON-only), so there is no file input — only URL + metadata.
export function ModelFormDialog({ model, token, onClose, onSaved }: ModelFormDialogProps) {
  const strings = admin.models;
  const isEdit = model !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(model));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleLayer(key: ModelLayerKey) {
    setForm((prev) => ({
      ...prev,
      layers: prev.layers.includes(key)
        ? prev.layers.filter((item) => item !== key)
        : [...prev.layers, key],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const light = toVersion(form.light);
    const layers: ModelLayerDef[] = form.layers.map((key) => ({
      key,
      meshNames: (form.meshNames[key] ?? '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
    }));

    const input: ModelInput = {
      titleTermKey: form.titleTermKey.trim(),
      system: form.system,
      versions:
        form.detailedEnabled && form.detailed.url.trim()
          ? { light, detailed: toVersion(form.detailed) }
          : { light },
      layers,
      license: form.license.trim(),
      attribution: form.attribution.trim(),
      sourceUrl: form.sourceUrl.trim(),
      status: form.status,
      ...(isEdit ? {} : { key: form.key.trim() }),
    };

    try {
      if (isEdit) {
        await updateModel(form.key, input, token);
      } else {
        await createModel(input, token);
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
            <span className="field__label">{strings.titleTermKey}</span>
            <input
              className="field__input field__input--mono"
              required
              value={form.titleTermKey}
              onChange={(event) => update('titleTermKey', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.system}</span>
            <select
              className="field__input"
              value={form.system}
              onChange={(event) => update('system', event.target.value as ModelSystem)}
            >
              {MODEL_SYSTEMS.map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{strings.status}</span>
            <select
              className="field__input"
              value={form.status}
              onChange={(event) => update('status', event.target.value as ModelStatus)}
            >
              {MODEL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {modelStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{strings.license}</span>
            <input
              className="field__input"
              required
              value={form.license}
              onChange={(event) => update('license', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.attribution}</span>
            <input
              className="field__input"
              required
              value={form.attribution}
              onChange={(event) => update('attribution', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.sourceUrl}</span>
            <input
              className="field__input field__input--mono"
              required
              value={form.sourceUrl}
              onChange={(event) => update('sourceUrl', event.target.value)}
            />
          </label>
        </div>

        <VersionFields
          legend={`${strings.versions} · ${strings.light}`}
          state={form.light}
          onChange={(value) => update('light', value)}
        />

        <div className="field">
          <label className="field__checkbox">
            <input
              type="checkbox"
              checked={form.detailedEnabled}
              onChange={(event) => update('detailedEnabled', event.target.checked)}
            />
            <span>{`${strings.versions} · ${strings.detailed} (${strings.optional})`}</span>
          </label>
        </div>
        {form.detailedEnabled ? (
          <VersionFields
            legend={`${strings.versions} · ${strings.detailed}`}
            state={form.detailed}
            onChange={(value) => update('detailed', value)}
          />
        ) : null}

        <fieldset className="fieldset">
          <legend className="field__label">{strings.layers}</legend>
          {MODEL_LAYERS.map((key) => (
            <div className="field" key={key}>
              <label className="field__checkbox">
                <input
                  type="checkbox"
                  checked={form.layers.includes(key)}
                  onChange={() => toggleLayer(key)}
                />
                <span>{layerLabel(key)}</span>
              </label>
              {form.layers.includes(key) ? (
                <input
                  className="field__input field__input--mono"
                  placeholder={strings.meshNames}
                  value={form.meshNames[key] ?? ''}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      meshNames: { ...prev.meshNames, [key]: event.target.value },
                    }))
                  }
                />
              ) : null}
            </div>
          ))}
        </fieldset>

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

interface VersionFieldsProps {
  legend: string;
  state: VersionState;
  onChange: (value: VersionState) => void;
}

function VersionFields({ legend, state, onChange }: VersionFieldsProps) {
  const strings = admin.models;
  return (
    <fieldset className="fieldset">
      <legend className="field__label">{legend}</legend>
      <div className="dialog__grid">
        <label className="field">
          <span className="field__label">{strings.url}</span>
          <input
            className="field__input field__input--mono"
            required
            value={state.url}
            onChange={(event) => onChange({ ...state, url: event.target.value })}
          />
        </label>
        <label className="field">
          <span className="field__label">{strings.sizeBytes}</span>
          <input
            className="field__input"
            type="number"
            min="0"
            required
            value={state.sizeBytes}
            onChange={(event) => onChange({ ...state, sizeBytes: event.target.value })}
          />
        </label>
        <label className="field">
          <span className="field__label">{strings.polyCount}</span>
          <input
            className="field__input"
            type="number"
            min="0"
            required
            value={state.polyCount}
            onChange={(event) => onChange({ ...state, polyCount: event.target.value })}
          />
        </label>
      </div>
    </fieldset>
  );
}
