import { useState, type FormEvent } from 'react';
import {
  TERM_CATEGORIES,
  TERM_SOURCES,
  TERM_STATUSES,
  type TermCategory,
  type TermSource,
  type TermStatus,
} from '@nabd/shared';
import { ApiError } from '../api/client';
import { createTerm, updateTerm, type Term, type TermInput } from '../api/terms';
import { admin, statusLabel } from '../i18n';

interface FormState {
  key: string;
  ar: string;
  fr: string;
  en: string;
  latin: string;
  category: TermCategory;
  source: TermSource;
  sourceRef: string;
  license: string;
  attribution: string;
  status: TermStatus;
}

function toFormState(term: Term | null): FormState {
  if (!term) {
    return {
      key: '',
      ar: '',
      fr: '',
      en: '',
      latin: '',
      category: 'anatomy',
      source: 'MANUAL',
      sourceRef: '',
      license: '',
      attribution: '',
      status: 'draft',
    };
  }
  return {
    key: term.key,
    ar: term.ar,
    fr: term.fr,
    en: term.en,
    latin: term.latin ?? '',
    category: term.category,
    source: term.source,
    sourceRef: term.sourceRef ?? '',
    license: term.license,
    attribution: term.attribution ?? '',
    status: term.status,
  };
}

interface TermFormDialogProps {
  term: Term | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

// Create/edit dialog. The API validates everything (zod) and its message is shown;
// the native `required` attributes only spare an obvious round trip.
export function TermFormDialog({ term, token, onClose, onSaved }: TermFormDialogProps) {
  const strings = admin.terms;
  const isEdit = term !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(term));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const input: TermInput = {
      ar: form.ar.trim(),
      fr: form.fr.trim(),
      en: form.en.trim(),
      latin: form.latin.trim() || undefined,
      category: form.category,
      source: form.source,
      sourceRef: form.sourceRef.trim() || undefined,
      license: form.license.trim(),
      attribution: form.attribution.trim() || undefined,
      status: form.status,
      ...(isEdit ? {} : { key: form.key.trim() }),
    };

    try {
      if (isEdit) {
        await updateTerm(form.key, input, token);
      } else {
        await createTerm(input, token);
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
            <span className="field__label">{strings.keyLabel}</span>
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
            <span className="field__label">{strings.ar}</span>
            <input
              className="field__input"
              dir="rtl"
              required
              value={form.ar}
              onChange={(event) => update('ar', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.fr}</span>
            <input
              className="field__input"
              required
              value={form.fr}
              onChange={(event) => update('fr', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.en}</span>
            <input
              className="field__input"
              required
              value={form.en}
              onChange={(event) => update('en', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">
              {strings.latin} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input"
              value={form.latin}
              onChange={(event) => update('latin', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{strings.category}</span>
            <select
              className="field__input"
              value={form.category}
              onChange={(event) => update('category', event.target.value as TermCategory)}
            >
              {TERM_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{strings.status}</span>
            <select
              className="field__input"
              value={form.status}
              onChange={(event) => update('status', event.target.value as TermStatus)}
            >
              {TERM_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{strings.source}</span>
            <select
              className="field__input"
              value={form.source}
              onChange={(event) => update('source', event.target.value as TermSource)}
            >
              {TERM_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">
              {strings.sourceRef} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input"
              value={form.sourceRef}
              onChange={(event) => update('sourceRef', event.target.value)}
            />
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
            <span className="field__label">
              {strings.attribution} <span className="field__hint">({strings.optional})</span>
            </span>
            <input
              className="field__input"
              value={form.attribution}
              onChange={(event) => update('attribution', event.target.value)}
            />
          </label>
        </div>

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
