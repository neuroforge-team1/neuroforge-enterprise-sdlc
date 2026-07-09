import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import TeamManagement from '../pages/TeamManagement';
import DevOps from '../pages/DevOps';
import RoleGuard from './RoleGuard';
import RequireAuth from './RequireAuth';

// "/" is the public landing page. Signing in and creating an account both
// hand off to Keycloak's hosted flow (see authStore's login()/register()) —
// there's intentionally no in-app password form. Everything under AppLayout
// requires a live session, enforced by RequireAuth.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/teams" element={<TeamManagement />} />
        <Route
          path="/devops"
          element={
            <RoleGuard role="ADMIN">
              <DevOps />
            </RoleGuard>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
