import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';

const ROLES = ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DEVOPS_ENGINEER'];

const PIPELINE = [
  {
    stage: 'Plan',
    detail: 'Create a project, set a milestone date, assign an owner.',
  },
  {
    stage: 'Build',
    detail: 'Add teams and developers so work has a clear home.',
  },
  {
    stage: 'Test',
    detail: 'Track status per project — active, on hold, or completed.',
  },
  {
    stage: 'Ship',
    detail: 'DevOps gets pipeline and environment visibility, gated by role.',
  },
];

const FEATURES = [
  {
    title: 'Role-based access, enforced end to end',
    detail: 'Five roles — Admin, Project Manager, Developer, Tester, DevOps Engineer — gate real routes and actions, not just hidden buttons.',
  },
  {
    title: 'Identity handled by Keycloak',
    detail: 'PKCE-secured sign-in. Passwords are never seen by, or stored on, our servers.',
  },
  {
    title: 'Project & milestone tracking',
    detail: 'Status, due dates, and ownership live in one view instead of three spreadsheets.',
  },
  {
    title: 'Team assignment that holds up',
    detail: 'Put the right person on the right project, and see who owns what at a glance.',
  },
  {
    title: 'A dashboard that answers the first question',
    detail: 'Active projects, total users, and team counts — the numbers you check every morning.',
  },
  {
    title: 'DevOps visibility, gated correctly',
    detail: 'Pipeline and environment status are visible only to the people who should see them.',
  },
];

function useReducedMotion() {
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  return reduced;
}

// The hero's signature element: a small live-looking console that mirrors
// the real in-app dashboard (see pages/Dashboard.jsx), so the first thing a
// visitor sees is an honest preview of the product, not stock art.
function ConsolePanel() {
  const reducedMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [lineCount, setLineCount] = useState(reducedMotion ? 4 : 0);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const reveal = setInterval(() => setLineCount((n) => Math.min(n + 1, 4)), 260);
    return () => clearInterval(reveal);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const pulse = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(pulse);
  }, [reducedMotion]);

  const logLines = [
    { label: 'auth', text: 'session established via keycloak · pkce', tone: 'success' },
    { label: 'rbac', text: `role resolved · ${ROLES[tick % ROLES.length].toLowerCase()}`, tone: 'signal' },
    { label: 'sync', text: 'projects, teams, dashboard · up to date', tone: 'success' },
    { label: 'devops', text: 'pipeline status · visible to admin only', tone: 'warning' },
  ];

  return (
    <div className="relative rounded-xl border border-panelBorder bg-panel shadow-2xl shadow-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-panelBorder">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-danger/70" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/70" aria-hidden="true" />
        </div>
        <p className="font-data text-xs text-muted">nexus / dashboard</p>
      </div>

      <div className="p-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Active projects', value: 12 },
          { label: 'Users', value: 38 },
          { label: 'Teams', value: 6 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-panelBorder bg-ink/60 px-3 py-3">
            <p className="text-[11px] text-muted">{stat.label}</p>
            <p className="font-data text-2xl text-slate-100 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 space-y-2 font-data text-xs">
        {logLines.slice(0, lineCount || logLines.length).map((line) => (
          <div
            key={line.label}
            className="flex items-center gap-2 rounded-md border border-panelBorder/70 bg-ink/40 px-3 py-2"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                line.tone === 'success' ? 'bg-success' : line.tone === 'warning' ? 'bg-warning' : 'bg-signal'
              }`}
              aria-hidden="true"
            />
            <span className="text-muted uppercase tracking-wide">{line.label}</span>
            <span className="text-slate-300 truncate">{line.text}</span>
          </div>
        ))}
        {!reducedMotion && lineCount < logLines.length && (
          <span className="inline-block w-1.5 h-3.5 bg-signal/80 animate-pulse" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function RoleChip({ role }) {
  const label = role
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
  return (
    <span className="font-data text-xs tracking-wide uppercase text-slate-300 border border-panelBorder bg-panel rounded-full px-3 py-1.5">
      {label}
    </span>
  );
}

export default function Landing() {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const heroRef = useRef(null);

  return (
    <div className="min-h-screen bg-ink text-slate-100 selection:bg-signal/30">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-panelBorder/70 bg-ink/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-data text-signal text-xs tracking-widest uppercase">Nexus</span>
            <span className="text-muted text-sm hidden sm:inline">NeuroForge</span>
          </div>
          <nav className="flex items-center gap-3">
            <button
              onClick={() => login()}
              className="text-sm text-slate-200 hover:text-white px-3 py-2 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => register()}
              className="text-sm font-medium bg-signal text-white hover:bg-blue-600 rounded-md px-4 py-2 transition-colors"
            >
              Create account
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div className="animate-[fadeUp_0.6s_ease-out_both]">

            <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight text-slate-50">
              Run the sprint without losing the thread.
            </h1>
            <p className="mt-5 text-lg text-muted max-w-md">
              One system of record for projects, teams, and access — built on real identity instead of
              a spreadsheet full of names and guesses.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => register()}
                className="bg-signal text-white hover:bg-blue-600 rounded-md px-5 py-3 text-sm font-medium transition-colors"
              >
                Create account
              </button>
              <button
                onClick={() => login()}
                className="border border-panelBorder text-slate-200 hover:bg-panel rounded-md px-5 py-3 text-sm font-medium transition-colors"
              >
                Sign in
              </button>
            </div>
            <p className="mt-4 text-xs text-muted font-data">Secured by Keycloak · PKCE</p>
          </div>

          <div className="animate-[fadeUp_0.7s_ease-out_0.1s_both]">
            <ConsolePanel />
          </div>
        </div>
      </section>

      {/* Role strip */}
      <section className="border-y border-panelBorder/70 bg-panel/40">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-sm text-muted mb-4">Built around who actually does the work</p>
          <div className="flex flex-wrap gap-2.5">
            {ROLES.map((role) => (
              <RoleChip key={role} role={role} />
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold text-slate-50">One board, four stages</h2>
        <p className="mt-2 text-muted max-w-lg">
          The same lifecycle every project moves through, reflected directly in the app.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE.map((step, i) => (
            <div
              key={step.stage}
              className="relative rounded-lg border border-panelBorder bg-panel p-5 hover:border-signal/50 transition-colors"
            >
              <p className="font-data text-xs text-signal">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-2 font-semibold text-slate-100">{step.stage}</p>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold text-slate-50">Everything the role needs, nothing it doesn't</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-panelBorder bg-panel p-6 hover:bg-panel/70 hover:border-panelBorder transition-colors"
            >
              <p className="font-semibold text-slate-100">{f.title}</p>
              <p className="mt-2 text-sm text-muted leading-relaxed">{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-panelBorder/70 bg-panel/40">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-50">Ready to bring order to the sprint?</h2>
            <p className="mt-1.5 text-muted">Sign in with your workspace account, or create a new one.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => register()}
              className="bg-signal text-white hover:bg-blue-600 rounded-md px-5 py-3 text-sm font-medium transition-colors"
            >
              Create account
            </button>
            <button
              onClick={() => login()}
              className="border border-panelBorder text-slate-200 hover:bg-panel rounded-md px-5 py-3 text-sm font-medium transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted">
        <span className="font-data">NeuroForge Nexus</span>
        <span>Secured by Keycloak</span>
      </footer>
    </div>
  );
}
