import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/teams', label: 'Teams' },
];

export default function Sidebar() {
  const hasRole = useAuthStore((s) => s.hasRole);
  const isAdmin = hasRole('ADMIN');

  return (
    <aside className="w-56 shrink-0 bg-panel border-r border-panelBorder min-h-screen px-3 py-6">
      <div className="px-3 mb-8">
        <p className="font-data text-signal text-xs tracking-widest uppercase">Nexus</p>
        <p className="text-slate-100 font-semibold text-sm mt-0.5">Milestone 1</p>
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-signalMuted text-white' : 'text-slate-300 hover:bg-panelBorder'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/devops"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-signalMuted text-white' : 'text-slate-300 hover:bg-panelBorder'
              }`
            }
          >
            DevOps
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
