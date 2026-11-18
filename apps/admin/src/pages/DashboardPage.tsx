import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { admin, brand } from '../i18n';
import { ModelsPage } from './ModelsPage';
import { TermsPage } from './TermsPage';

const NAV_ITEMS = [
  'overview',
  'organs',
  'terms',
  'lessons',
  'cases',
  'quizzes',
  'users',
  'settings',
] as const;

type Section = (typeof NAV_ITEMS)[number];

// Shell (sidebar + main) for the admin dashboard. Layout follows
// design/screens/05-admin-terms.svg; sections beyond Terms are placeholders (T-021+).
export function DashboardPage() {
  const { session, signOut } = useAuth();
  const [section, setSection] = useState<Section>('overview');

  if (!session) {
    return null;
  }
  const { user } = session;

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="shell__brand">
          <span className="shell__wordmark">{brand.wordmark}</span>
          <span className="shell__brand-label">{admin.brandLabel}</span>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className={item === section ? 'nav__item nav__item--active' : 'nav__item'}
              type="button"
              onClick={() => setSection(item)}
            >
              {admin.nav[item]}
            </button>
          ))}
        </nav>
      </aside>

      <main className="shell__main">
        <header className="shell__header">
          <h1 className="shell__title">{admin.nav[section]}</h1>
          <button className="button button--secondary" type="button" onClick={signOut}>
            {admin.session.signOut}
          </button>
        </header>

        {section === 'terms' ? (
          <TermsPage token={session.token} />
        ) : section === 'organs' ? (
          <ModelsPage token={session.token} />
        ) : (
          <section className="card">
            <p className="card__muted">
              {admin.session.signedInAs} {user.name} — {user.email} ({user.role})
            </p>
            <p className="card__muted">{admin.session.comingSoon}</p>
          </section>
        )}
      </main>
    </div>
  );
}
