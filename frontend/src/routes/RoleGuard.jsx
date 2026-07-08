import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Wrap a route element to require a specific realm role, e.g.
// <RoleGuard role="ADMIN"><DevOps /></RoleGuard>
export default function RoleGuard({ role, children }) {
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!hasRole(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
