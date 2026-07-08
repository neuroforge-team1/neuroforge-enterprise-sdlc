import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import TeamManagement from '../pages/TeamManagement';
import DevOps from '../pages/DevOps';
import RoleGuard from './RoleGuard';

// There is no /login route: keycloak.init({ onLoad: 'login-required' }) in
// main.jsx already forces a redirect to Keycloak before the app ever renders,
// so every route below is implicitly authenticated.
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
