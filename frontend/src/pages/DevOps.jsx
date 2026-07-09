import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/common/Loader';

const ROADMAP = [
  { milestone: 'M1', label: 'Role & routing scaffold', done: true },
  { milestone: 'M3', label: 'CI/CD pipeline integration', done: false },
  { milestone: 'M4', label: 'Deployment & environment monitoring', done: false },
];

// This screen is intentionally a stub for Milestone 1: it exists to prove
// the DEVOPS_ENGINEER role works end to end (sidebar link -> protected
// route -> role-gated API call), ahead of real pipeline data landing in
// Milestones 3-4. See DevOpsController on the backend.
export default function DevOps() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/devops/health')
      .then((res) => setStatus(res.data))
      .catch(() => setError('Could not reach the DevOps endpoint.'));
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-100">DevOps</h1>
      <p className="text-muted mt-1">
        Deployment and pipeline visibility for this role arrive in later milestones — here's what's live now
        and what's next.
      </p>

      <div className="mt-6 bg-panel border border-panelBorder rounded-lg p-6">
        <p className="font-data text-xs text-muted uppercase tracking-wide mb-3">Live endpoint check</p>
        {error && <p className="text-danger text-sm">{error}</p>}
        {!status && !error && <Loader label="Checking status…" />}
        {status && (
          <div className="flex items-center gap-2 font-data text-sm">
            <span className="w-2 h-2 rounded-full bg-warning" aria-hidden="true" />
            <span className="text-slate-100">{status.status}</span>
            <span className="text-muted">— {status.note}</span>
          </div>
        )}
      </div>

      <div className="mt-6 bg-panel border border-panelBorder rounded-lg p-6">
        <p className="font-data text-xs text-muted uppercase tracking-wide mb-4">Roadmap</p>
        <ol className="space-y-3">
          {ROADMAP.map((item) => (
            <li key={item.milestone} className="flex items-center gap-3 text-sm">
              <span
                className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-data ${
                  item.done ? 'bg-success/15 border-success/30 text-success' : 'border-panelBorder text-muted'
                }`}
              >
                {item.done ? '✓' : ''}
              </span>
              <span className={item.done ? 'text-slate-100' : 'text-muted'}>{item.label}</span>
              <span className="font-data text-xs text-muted ml-auto">{item.milestone}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
