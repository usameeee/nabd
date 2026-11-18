import { useEffect, useState } from 'react';
import {
  TERM_CATEGORIES,
  TERM_STATUSES,
  type TermCategory,
  type TermStats,
  type TermStatus,
} from '@nabd/shared';
import { ApiError } from '../api/client';
import { getTermStats, listTerms, type Term, type TermList } from '../api/terms';
import { TermFormDialog } from '../components/TermFormDialog';
import { admin, statusLabel } from '../i18n';

const PAGE_SIZE = 10;
const EMPTY_STATS: TermStats = { total: 0, drafts: 0, needsReview: 0, verified: 0 };

// Status → pill modifier. Colors come from the shared danger/warning/success tokens.
const PILL_CLASS: Record<TermStatus, string> = {
  draft: 'pill',
  needs_review: 'pill pill--warning',
  verified: 'pill pill--success',
};

interface TermsPageProps {
  token: string;
}

// Terms & translation: stat cards + search/filters + the AR/FR/EN table with create/edit
// (design/screens/05-admin-terms.svg). Data comes from `GET /terms/manage` + `GET /terms/stats`.
export function TermsPage({ token }: TermsPageProps) {
  const strings = admin.terms;

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<TermCategory | ''>('');
  const [status, setStatus] = useState<TermStatus | ''>('');

  const [list, setList] = useState<TermList | null>(null);
  const [stats, setStats] = useState<TermStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Term | null>(null);

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

    Promise.all([
      listTerms(
        {
          page,
          limit: PAGE_SIZE,
          q: search || undefined,
          category: category || undefined,
          status: status || undefined,
        },
        token,
      ),
      getTermStats(token),
    ])
      .then(([termList, termStats]) => {
        if (cancelled) return;
        setList(termList);
        setStats(termStats);
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
  }, [page, search, category, status, token, reloadKey, strings.error]);

  const items = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const verifiedPercent = stats.total === 0 ? null : Math.round((stats.verified / stats.total) * 100);

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
      <div className="stats">
        <StatCard label={strings.total} value={String(stats.total)} />
        <StatCard label={strings.pending} value={String(stats.needsReview)} />
        <StatCard
          label={strings.verified}
          value={verifiedPercent === null ? '—' : `${verifiedPercent}%`}
        />
      </div>

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
          aria-label={strings.category}
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as TermCategory | '');
            setPage(1);
          }}
        >
          <option value="">{`${strings.category}: ${strings.all}`}</option>
          {TERM_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="field__input toolbar__select"
          aria-label={strings.status}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as TermStatus | '');
            setPage(1);
          }}
        >
          <option value="">{`${strings.status}: ${strings.all}`}</option>
          {TERM_STATUSES.map((option) => (
            <option key={option} value={option}>
              {statusLabel(option)}
            </option>
          ))}
        </select>

        <span className="chip">{strings.languages}</span>

        <button
          className="button button--primary toolbar__action"
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          {strings.newTerm}
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
              <th className="table__ar">{strings.colAr}</th>
              <th>{strings.colFr}</th>
              <th>{strings.colEn}</th>
              <th>{strings.colSource}</th>
              <th>{strings.colStatus}</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {items.map((term) => (
              <tr key={term._id}>
                <td className="table__ar" dir="rtl">
                  {term.ar}
                </td>
                <td>{term.fr}</td>
                <td>{term.en}</td>
                <td className="table__mono">{term.source}</td>
                <td>
                  <span className={PILL_CLASS[term.status]}>{statusLabel(term.status)}</span>
                </td>
                <td className="table__actions">
                  <button className="link" type="button" onClick={() => setEditing(term)}>
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
        <TermFormDialog term={editing} token={token} onClose={closeDialog} onSaved={reload} />
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
