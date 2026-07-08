import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/common/Loader';

// Placeholder screen for the DEVOPS_ENGINEER role in Milestone 1. Real
// deployment/pipeline visibility arrives in Milestones 3-4; this exists so
// role-gated routing and backend authorization can be exercised end-to-end
// now.
export default function DevOps() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/devops/health')
      .then((res) => setStatus(res.data))
      .catch(() => setError('Could not reach DevOps endpoint.'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-100">DevOps</h1>
      <p className="text-muted mt-1">Deployment tracking and pipeline health arrive in Milestone 3/4.</p>

      <div className="mt-6 bg-panel border border-panelBorder rounded-lg p-6 max-w-md">
        {error && <p className="text-danger text-sm">{error}</p>}
        {!status && !error && <Loader label="Checking status…" />}
        {status && (
          <dl className="font-data text-sm space-y-2">
            <div><dt className="text-muted inline">status: </dt><dd className="inline text-slate-100">{status.status}</dd></div>
            <div><dt className="text-muted inline">note: </dt><dd className="inline text-slate-100">{status.note}</dd></div>
          </dl>
        )}
      </div>
    </div>
  );
}
