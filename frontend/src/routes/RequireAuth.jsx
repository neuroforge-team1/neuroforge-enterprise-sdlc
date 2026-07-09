import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/common/Loader';

// Wraps the authenticated part of the app. While check-sso is still
// resolving we show a loader instead of flashing the landing page; once it
// resolves, anyone without a session is sent back to "/" to sign in.
export default function RequireAuth({ children }) {
  const initialized = useAuthStore((s) => s.initialized);
  const authenticated = useAuthStore((s) => s.authenticated);
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <Loader label="Checking your session…" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
