import { useState, type FormEvent } from 'react';
import { MODEL_LAYERS, type ModelLayerKey } from '@nabd/shared';
import { ApiError } from '../api/client';
import { createHotspot, updateHotspot, type Hotspot, type HotspotInput } from '../api/models';
import { admin, layerLabel } from '../i18n';

interface FormState {
  termKey: string;
  meshName: string;
  layer: ModelLayerKey | '';
  order: string;
  position: [string, string, string];
  cameraPosition: [string, string, string];
  cameraTarget: [string, string, string];
  zoom: string;
}

const ZERO: [string, string, string] = ['0', '0', '0'];

function vec3(values: [number, number, number] | undefined): [string, string, string] {
  if (!values) return ZERO;
  return [String(values[0]), String(values[1]), String(values[2])];
}

function toFormState(hotspot: Hotspot | null): FormState {
  if (!hotspot) {
    return {
      termKey: '',
      meshName: '',
      layer: '',
      order: '1',
      position: ZERO,
      cameraPosition: ZERO,
      cameraTarget: ZERO,
      zoom: '',
    };
  }
  return {
    termKey: hotspot.termKey,
    meshName: hotspot.meshName ?? '',
    layer: hotspot.layer ?? '',
    order: String(hotspot.order),
    position: vec3(hotspot.position),
    cameraPosition: vec3(hotspot.camera.position),
    cameraTarget: vec3(hotspot.camera.target),
    zoom: hotspot.camera.zoom === undefined ? '' : String(hotspot.camera.zoom),
  };
}

function toNumbers(state: [string, string, string]): [number, number, number] {
  return [Number(state[0]) || 0, Number(state[1]) || 0, Number(state[2]) || 0];
}

interface HotspotFormDialogProps {
  modelKey: string;
  hotspot: Hotspot | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

// Create/edit dialog for a hotspot. Positions and the camera are 3D vectors the
// editor reads off the model (docs/03); the viewer uses them to focus the camera.
export function HotspotFormDialog({
  modelKey,
  hotspot,
  token,
  onClose,
  onSaved,
}: HotspotFormDialogProps) {
  const strings = admin.models;
  const isEdit = hotspot !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(hotspot));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const input: HotspotInput = {
      modelKey,
      termKey: form.termKey.trim(),
      meshName: form.meshName.trim() || undefined,
      position: toNumbers(form.position),
      layer: form.layer || undefined,
      camera: {
        position: toNumbers(form.cameraPosition),
        target: toNumbers(form.cameraTarget),
        zoom: form.zoom.trim() ? Number(form.zoom) : undefined,
      },
      order: Number(form.order) || 1,
    };

    try {
      if (isEdit) {
        await updateHotspot(hotspot._id, input, token);
      } else {
        await createHotspot(input, token);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.errorHotspot);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dialog" role="dialog" aria-modal="true">
      <form className="dialog__card" onSubmit={handleSubmit}>
        <h2 className="dialog__title">
          {isEdit ? strings.editHotspotTitle : strings.createHotspotTitle}
        </h2>

        <div className="dialog__grid">
          <label className="field">
            <span className="field__label">{strings.linkedTerm}</span>
            <input
              className="field__input field__input--mono"
              required
              value={form.termKey}
              onChange={(event) => update('termKey', event.target.value)}
            />
            <span className="field__hint">{strings.termKeyHint}</span>
          </label>

          <label className="field">
            <span className="field__label">{strings.meshName}</span>
            <input
              className="field__input field__input--mono"
              value={form.meshName}
              onChange={(event) => update('meshName', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.layer}</span>
            <select
              className="field__input"
              value={form.layer}
              onChange={(event) => update('layer', event.target.value as ModelLayerKey | '')}
            >
              <option value="">{`${strings.layer}: ${strings.none}`}</option>
              {MODEL_LAYERS.map((key) => (
                <option key={key} value={key}>
                  {layerLabel(key)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{strings.order}</span>
            <input
              className="field__input"
              type="number"
              min="1"
              required
              value={form.order}
              onChange={(event) => update('order', event.target.value)}
            />
          </label>
        </div>

        <Vec3Fields
          legend={strings.position}
          value={form.position}
          onChange={(value) => update('position', value)}
        />

        <Vec3Fields
          legend={strings.cameraPosition}
          value={form.cameraPosition}
          onChange={(value) => update('cameraPosition', value)}
        />

        <Vec3Fields
          legend={strings.cameraTarget}
          value={form.cameraTarget}
          onChange={(value) => update('cameraTarget', value)}
        />

        <label className="field">
          <span className="field__label">{strings.cameraZoom}</span>
          <input
            className="field__input"
            type="number"
            min="0"
            step="0.1"
            value={form.zoom}
            onChange={(event) => update('zoom', event.target.value)}
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

interface Vec3FieldsProps {
  legend: string;
  value: [string, string, string];
  onChange: (value: [string, string, string]) => void;
}

function Vec3Fields({ legend, value, onChange }: Vec3FieldsProps) {
  return (
    <fieldset className="fieldset">
      <legend className="field__label">{legend}</legend>
      <div className="vec3">
        {(['X', 'Y', 'Z'] as const).map((axis, index) => (
          <label className="field" key={axis}>
            <span className="field__label">{axis}</span>
            <input
              className="field__input field__input--mono"
              type="number"
              step="0.01"
              value={value[index]}
              onChange={(event) =>
                onChange(
                  value.map((item, i) => (i === index ? event.target.value : item)) as [
                    string,
                    string,
                    string,
                  ],
                )
              }
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
