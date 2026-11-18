import { useState, type FormEvent } from 'react';
import { login } from '../api/auth';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { admin, brand } from '../i18n';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      signIn(result);
    } catch (err) {
      if (err instanceof ApiError && err.code !== 'INVALID_CREDENTIALS') {
        setError(err.message);
      } else {
        setError(admin.login.failed);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__brand">
          <h1 className="login__wordmark">{brand.wordmark}</h1>
          <span className="login__brand-label">{admin.brandLabel}</span>
        </div>

        <h2 className="login__title">{admin.login.title}</h2>
        <p className="login__subtitle">{admin.login.subtitle}</p>

        <div className="login__form">
          <label className="field">
            <span className="field__label">{admin.login.email}</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">{admin.login.password}</span>
            <input
              className="field__input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? (
            <p className="login__error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? admin.login.submitting : admin.login.submit}
          </button>
        </div>
      </form>
    </main>
  );
}
