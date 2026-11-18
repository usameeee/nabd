import { useEffect, useState } from 'react';
import { DISEASE_STATUSES, type DiseaseStatus } from '@nabd/shared';
import { ApiError } from '../api/client';
import { listDiseases, type Disease, type DiseaseList } from '../api/diseases';
import { DiseaseFormDialog } from '../components/DiseaseFormDialog';
import { admin, diseaseStatusLabel } from '../i18n';

const PAGE_SIZE = 10;

// Status → pill modifier (same colors as the terms/models tables).
const PILL_CLASS: Record<DiseaseStatus, string> = {
  draft: 'pill',
  needs_review: 'pill pill--warning',
  verified: 'pill pill--success',
};

interface DiseasesPageProps {
  token: string;
}

// Diseases: list + search/status filters + the stage/symptom editor (docs/03 → diseases).
// A disease never copies term text — `termKey`/`symptomTermKeys` point at the terms collection.
export function DiseasesPage({ token }: DiseasesPageProps) {
  const strings = admin.diseases;

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DiseaseStatus | ''>('');

  const [list, setList] = useState<DiseaseList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Disease | null>(null);

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listDiseases(
      { page, limit: PAGE_SIZE, q: search || undefined, status: status || undefined },
      token,
    )
      .then((result) => {
        if (!cancelled) setList(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : strings.error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search, status, token, reloadKey, strings.error]);

  const items = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  function closeDialog() {
    setCreating(false);
    setEditing(null);
  }

  function reload() {
    closeDialog();
    setReloadKey((key) => key + 1);
  }

  return (
    <div className="terms">
      <div className="toolbar">
        <input
          className="field__input toolbar__search"
          type="search"
          placeholder={strings.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <select
          className="field__input toolbar__select"
          aria-label={strings.status}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as DiseaseStatus | '');
            setPage(1);
          }}
        >
          <option value="">{`${strings.status}: ${strings.all}`}</option>
          {DISEASE_STATUSES.map((option) => (
            <option key={option} value={option}>
              {diseaseStatusLabel(option)}
            </option>
          ))}
        </select>

        <button
          className="button button--primary toolbar__action"
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          {strings.newDisease}
        </button>
      </div>

      {error ? (
        <p className="login__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="card card--flush">
        <table className="table">
          <thead>
            <tr>
              <th>{strings.colKey}</th>
              <th>{strings.colTerm}</th>
              <th>{strings.colModel}</th>
              <th>{strings.colStages}</th>
              <th>{strings.colStatus}</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {items.map((disease) => (
              <tr key={disease._id}>
                <td className="table__mono">{disease.key}</td>
                <td className="table__mono">{disease.termKey}</td>
                <td className="table__mono">{disease.modelKey}</td>
                <td>{disease.stages.length}</td>
                <td>
                  <span className={PILL_CLASS[disease.status]}>
                    {diseaseStatusLabel(disease.status)}
                  </span>
                </td>
                <td className="table__actions">
                  <button className="link" type="button" onClick={() => setEditing(disease)}>
                    {strings.edit}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td className="table__empty" colSpan={6}>
                  {strings.empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <span className="pager__info">
          {from}–{to} / {total} · {strings.page} {page}
        </span>
        <div className="pager__actions">
          <button
            className="button button--secondary"
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            {strings.previous}
          </button>
          <button
            className="button button--secondary"
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            {strings.next}
          </button>
        </div>
      </div>

      {creating || editing ? (
        <DiseaseFormDialog
          disease={editing}
          token={token}
          onClose={closeDialog}
          onSaved={reload}
        />
      ) : null}
    </div>
  );
}
