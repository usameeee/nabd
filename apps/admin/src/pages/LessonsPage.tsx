import { useEffect, useState } from 'react';
import { LESSON_STATUSES, type LessonStatus } from '@nabd/shared';
import { ApiError } from '../api/client';
import { listLessons, type Lesson, type LessonList } from '../api/lessons';
import { LessonFormDialog } from '../components/LessonFormDialog';
import { admin, lessonStatusLabel } from '../i18n';

const PAGE_SIZE = 10;

// Status → pill modifier (same colors as the terms/models/diseases tables).
const PILL_CLASS: Record<LessonStatus, string> = {
  draft: 'pill',
  needs_review: 'pill pill--warning',
  verified: 'pill pill--success',
};

interface LessonsPageProps {
  token: string;
}

// Lessons: list + search/status filters + the step editor (docs/03 → lessons).
// Steps reference models/hotspots/diseases/videos/quizzes by key/id — never copied content.
export function LessonsPage({ token }: LessonsPageProps) {
  const strings = admin.lessons;

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LessonStatus | ''>('');

  const [list, setList] = useState<LessonList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

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

    listLessons({ page, limit: PAGE_SIZE, q: search || undefined, status: status || undefined }, token)
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
            setStatus(event.target.value as LessonStatus | '');
            setPage(1);
          }}
        >
          <option value="">{`${strings.status}: ${strings.all}`}</option>
          {LESSON_STATUSES.map((option) => (
            <option key={option} value={option}>
              {lessonStatusLabel(option)}
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
          {strings.newLesson}
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
              <th>{strings.colTitle}</th>
              <th>{strings.colUnit}</th>
              <th>{strings.colOrder}</th>
              <th>{strings.colSteps}</th>
              <th>{strings.colStatus}</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {items.map((lesson) => (
              <tr key={lesson._id}>
                <td className="table__mono">{lesson.key}</td>
                <td>{lesson.title.ar}</td>
                <td>{lesson.unit}</td>
                <td>{lesson.order}</td>
                <td>{lesson.steps.length}</td>
                <td>
                  <span className={PILL_CLASS[lesson.status]}>
                    {lessonStatusLabel(lesson.status)}
                  </span>
                </td>
                <td className="table__actions">
                  <button className="link" type="button" onClick={() => setEditing(lesson)}>
                    {strings.edit}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td className="table__empty" colSpan={7}>
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
        <LessonFormDialog
          lesson={editing}
          token={token}
          onClose={closeDialog}
          onSaved={reload}
        />
      ) : null}
    </div>
  );
}
