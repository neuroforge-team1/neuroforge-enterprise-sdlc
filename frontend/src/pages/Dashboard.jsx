import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import Loader from '../components/common/Loader';
import { useAuthStore } from '../store/authStore';

function StatCard({ label, value }) {
  return (
    <div className="bg-panel border border-panelBorder rounded-lg p-6">
      <p className="text-muted text-sm">{label}</p>
      <p className="font-data text-4xl text-slate-100 mt-2">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    dashboardService
      .getSummary()
      .then(setSummary)
      .catch(() => setError('Could not load dashboard summary.'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-100">Welcome back, {user?.name?.split(' ')[0] || 'there'}</h1>
      <p className="text-muted mt-1">Here's what's happening across the platform.</p>

      <div className="mt-8">
        {error && <p className="text-danger text-sm">{error}</p>}
        {!summary && !error && <Loader label="Loading dashboard…" />}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Active projects" value={summary.activeProjects} />
            <StatCard label="Users" value={summary.totalUsers} />
            <StatCard label="Teams" value={summary.totalTeams} />
          </div>
        )}
      </div>
    </div>
  );
}
