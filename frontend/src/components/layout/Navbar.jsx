import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-panelBorder bg-ink">
      <div>
        <p className="text-sm text-muted">Project &amp; User Management</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-slate-100">{user?.name}</p>
          <p className="text-xs text-muted">{roles.join(', ') || 'No roles assigned'}</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-muted hover:text-slate-100 border border-panelBorder rounded-md px-3 py-1.5"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
