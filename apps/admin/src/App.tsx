import { AuthProvider, useAuth } from './auth/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

function Routes() {
  const { session } = useAuth();
  return session ? <DashboardPage /> : <LoginPage />;
}

export function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
