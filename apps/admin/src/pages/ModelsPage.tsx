import { useEffect, useState } from 'react';
import type { ModelStatus, ModelVersion } from '@nabd/shared';
import { ApiError } from '../api/client';
import {
  deleteHotspot,
  listHotspots,
  listModels,
  updateModel,
  type Hotspot,
  type Model3D,
  type ModelInput,
} from '../api/models';
import { HotspotFormDialog } from '../components/HotspotFormDialog';
import { ModelFormDialog } from '../components/ModelFormDialog';
import { admin, layerLabel, modelStatusLabel } from '../i18n';

// Status → pill modifier (same colors as the terms table).
const PILL_CLASS: Record<ModelStatus, string> = {
  draft: 'pill',
  verified: 'pill pill--success',
};

// A model document without an `_id`/`key` — the same shape `createModel`/`updateModel` send.
function modelToInput(model: Model3D): ModelInput {
  return {
    titleTermKey: model.titleTermKey,
    system: model.system,
    versions: model.versions,
    layers: model.layers,
    license: model.license,
    attribution: model.attribution,
    sourceUrl: model.sourceUrl,
    status: model.status,
  };
}

// Bytes → "2.4 MB" (display only; the API stores bytes).
function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function formatVec3(values: [number, number, number]): string {
  return values.map((value) => String(value)).join(', ');
}

// A version row in the "versions & license" panel: label + numbers + a hint badge.
function VersionRow({ label, version, hint }: { label: string; version?: ModelVersion; hint: string }) {
  const strings = admin.models;
  return (
    <div className="models__version">
      <span className="models__version-name">
        {version
          ? `${label} · ${version.polyCount.toLocaleString()} · ${formatBytes(version.sizeBytes)}`
          : `${label} · ${strings.none}`}
      </span>
      <span className="pill pill--success">{hint}</span>
    </div>
  );
}

interface ModelsPageProps {
  token: string;
}

// Organs & models: model metadata + hotspot editor (design/screens/06-admin-model-hotspot-editor.svg).
// There is no 3D viewport here yet — the API stores geometry as an external URL (D-037), so the
// editor manages metadata and hotspot coordinates while the viewer does the rendering.
export function ModelsPage({ token }: ModelsPageProps) {
  const strings = admin.models;

  const [models, setModels] = useState<Model3D[]>([]);
  const [modelKey, setModelKey] = useState('');
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [modelDialog, setModelDialog] = useState<{ open: boolean; model: Model3D | null }>({
    open: false,
    model: null,
  });
  const [hotspotDialog, setHotspotDialog] = useState<{ open: boolean; hotspot: Hotspot | null }>({
    open: false,
    hotspot: null,
  });
  const [publishing, setPublishing] = useState(false);

  const current = models.find((item) => item.key === modelKey) ?? null;
  const selected = hotspots.find((item) => item._id === selectedHotspotId) ?? null;

  // Load the model list; keep the current selection valid across reloads.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listModels({ limit: 100 }, token)
      .then((result) => {
        if (cancelled) return;
        setModels(result.items);
        setModelKey((key) => {
          if (key && result.items.some((item) => item.key === key)) return key;
          return result.items[0]?.key ?? '';
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : strings.error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, strings.error]);

  // Load the hotspots of the selected model.
  useEffect(() => {
    if (!modelKey) {
      setHotspots([]);
      setSelectedHotspotId('');
      return;
    }
    let cancelled = false;
    listHotspots({ modelKey, limit: 200 }, token)
      .then((result) => {
        if (cancelled) return;
        setHotspots(result.items);
        setSelectedHotspotId((id) =>
          result.items.some((item) => item._id === id) ? id : '',
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : strings.error);
      });
    return () => {
      cancelled = true;
    };
  }, [modelKey, token, reloadKey, strings.error]);

  function reload() {
    setModelDialog({ open: false, model: null });
    setHotspotDialog({ open: false, hotspot: null });
    setReloadKey((key) => key + 1);
  }

  async function togglePublish() {
    if (!current) return;
    setPublishing(true);
    setError(null);
    try {
      const nextStatus: ModelStatus = current.status === 'verified' ? 'draft' : 'verified';
      await updateModel(current.key, { ...modelToInput(current), status: nextStatus }, token);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.error);
    } finally {
      setPublishing(false);
    }
  }

  async function removeHotspot(hotspot: Hotspot) {
    if (!window.confirm(strings.confirmDeleteHotspot)) return;
    setError(null);
    try {
      await deleteHotspot(hotspot._id, token);
      setSelectedHotspotId('');
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.error);
    }
  }

  return (
    <div className="models">
      <div className="toolbar">
        <select
          className="field__input toolbar__select"
          aria-label={strings.selectPrompt}
          value={modelKey}
          onChange={(event) => {
            setModelKey(event.target.value);
            setSelectedHotspotId('');
          }}
        >
          <option value="">{strings.selectPrompt}</option>
          {models.map((model) => (
            <option key={model.key} value={model.key}>
              {model.key}
            </option>
          ))}
        </select>

        <button
          className="button button--secondary toolbar__action"
          type="button"
          disabled={!current}
          onClick={() => setModelDialog({ open: true, model: current })}
        >
          {strings.editModel}
        </button>
        <button
          className="button button--primary"
          type="button"
          onClick={() => setModelDialog({ open: true, model: null })}
        >
          {strings.newModel}
        </button>
      </div>

      {error ? (
        <p className="login__error" role="alert">
          {error}
        </p>
      ) : null}

      {!current ? (
        <section className="card">
          <p className="card__muted">{loading ? strings.selectPrompt : strings.empty}</p>
        </section>
      ) : (
        <>
          <header className="models__head">
            <h2 className="models__name">{current.key}</h2>
            <span className={PILL_CLASS[current.status]}>{modelStatusLabel(current.status)}</span>
            <div className="models__head-actions">
              <button
                className="button button--primary"
                type="button"
                disabled={publishing}
                onClick={togglePublish}
              >
                {current.status === 'verified' ? strings.unpublish : strings.publish}
              </button>
            </div>
          </header>

          <div className="models__grid">
            <section className="card card--flush">
              <div className="models__panel-head">
                <h3 className="models__panel-title">{strings.hotspots}</h3>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => setHotspotDialog({ open: true, hotspot: null })}
                >
                  {strings.newHotspot}
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>{strings.order}</th>
                    <th>{strings.linkedTerm}</th>
                    <th>{strings.layer}</th>
                    <th aria-hidden="true" />
                  </tr>
                </thead>
                <tbody>
                  {hotspots.map((hotspot) => (
                    <tr
                      key={hotspot._id}
                      className={hotspot._id === selectedHotspotId ? 'table__row--active' : undefined}
                    >
                      <td>{hotspot.order}</td>
                      <td className="table__mono">{hotspot.termKey}</td>
                      <td>{hotspot.layer ? layerLabel(hotspot.layer) : strings.none}</td>
                      <td className="table__actions">
                        <button
                          className="link"
                          type="button"
                          onClick={() => setSelectedHotspotId(hotspot._id)}
                        >
                          {strings.edit}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {hotspots.length === 0 ? (
                    <tr>
                      <td className="table__empty" colSpan={4}>
                        {strings.noHotspots}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </section>

            <aside className="card">
              {selected ? (
                <HotspotDetail
                  hotspot={selected}
                  noneLabel={strings.none}
                  onEdit={() => setHotspotDialog({ open: true, hotspot: selected })}
                  onDelete={() => removeHotspot(selected)}
                />
              ) : (
                <p className="card__muted">{strings.selectHotspot}</p>
              )}
            </aside>
          </div>

          <section className="card">
            <h3 className="models__panel-title">{strings.versionsLicense}</h3>
            <VersionRow
              label={strings.light}
              version={current.versions.light}
              hint={strings.lightHint}
            />
            <VersionRow
              label={strings.detailed}
              version={current.versions.detailed}
              hint={strings.detailedHint}
            />
            <div className="models__version">
              <span className="models__version-name">
                {`${strings.license}: ${current.license}`}
              </span>
              <span className="pill pill--warning">{strings.attributionRequired}</span>
            </div>
          </section>
        </>
      )}

      {modelDialog.open ? (
        <ModelFormDialog
          model={modelDialog.model}
          token={token}
          onClose={() => setModelDialog({ open: false, model: null })}
          onSaved={reload}
        />
      ) : null}

      {hotspotDialog.open && current ? (
        <HotspotFormDialog
          modelKey={current.key}
          hotspot={hotspotDialog.hotspot}
          token={token}
          onClose={() => setHotspotDialog({ open: false, hotspot: null })}
          onSaved={reload}
        />
      ) : null}
    </div>
  );
}

interface HotspotDetailProps {
  hotspot: Hotspot;
  noneLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}

function HotspotDetail({ hotspot, noneLabel, onEdit, onDelete }: HotspotDetailProps) {
  const strings = admin.models;
  return (
    <div className="models__detail">
      <h3 className="models__panel-title">
        {strings.point} {hotspot.order}
      </h3>

      <Row label={strings.linkedTerm} value={hotspot.termKey} mono />
      {hotspot.meshName ? <Row label={strings.meshName} value={hotspot.meshName} mono /> : null}
      <Row
        label={strings.layer}
        value={hotspot.layer ? layerLabel(hotspot.layer) : noneLabel}
      />
      <Row label={strings.position} value={formatVec3(hotspot.position)} mono />
      <Row label={strings.cameraPosition} value={formatVec3(hotspot.camera.position)} mono />
      <Row label={strings.cameraTarget} value={formatVec3(hotspot.camera.target)} mono />
      {hotspot.camera.zoom !== undefined ? (
        <Row label={strings.cameraZoom} value={String(hotspot.camera.zoom)} mono />
      ) : null}

      <div className="models__detail-actions">
        <button className="button button--secondary" type="button" onClick={onEdit}>
          {strings.edit}
        </button>
        <button className="button button--danger" type="button" onClick={onDelete}>
          {strings.deleteHotspot}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="models__detail-row">
      <span className="field__label">{label}</span>
      <span className={mono ? 'models__value models__value--mono' : 'models__value'}>{value}</span>
    </div>
  );
}
