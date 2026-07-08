import { useEffect, useState } from 'react';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [addMemberTeamId, setAddMemberTeamId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  const hasRole = useAuthStore((s) => s.hasRole);
  const canManage = hasRole('PROJECT_MANAGER') || hasRole('ADMIN');

  const load = () => {
    setLoading(true);
    Promise.all([teamService.getAll(), userService.getAll().catch(() => [])])
      .then(([teamList, userList]) => {
        setTeams(teamList);
        setUsers(userList);
        setLoading(false);
      })
      .catch(() => setError('Could not load teams.'));
  };

  useEffect(load, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    await teamService.create({ name: newTeamName });
    setNewTeamName('');
    setCreateOpen(false);
    load();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    await teamService.addMember(addMemberTeamId, selectedUserId);
    setAddMemberTeamId(null);
    setSelectedUserId('');
    load();
  };

  const handleRemoveMember = async (teamId, userId) => {
    await teamService.removeMember(teamId, userId);
    load();
  };

  if (loading) return <Loader label="Loading teams…" />;
  if (error) return <p className="text-danger text-sm">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Teams</h1>
          <p className="text-muted mt-1">Assign people to teams so projects have owners.</p>
        </div>
        {canManage && <Button onClick={() => setCreateOpen(true)}>New team</Button>}
      </div>

      {teams.length === 0 && (
        <EmptyState
          title="No teams yet"
          description={canManage ? 'Create a team to start assigning members.' : 'Ask a project manager to create one.'}
        />
      )}

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-panel border border-panelBorder rounded-lg p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-100">{team.name}</h3>
              {canManage && (
                <Button variant="ghost" onClick={() => setAddMemberTeamId(team.id)}>Add member</Button>
              )}
            </div>
            <ul className="mt-3 space-y-1">
              {team.members.length === 0 && <li className="text-muted text-sm">No members yet.</li>}
              {team.members.map((member) => (
                <li key={member.id} className="flex items-center justify-between text-sm text-slate-300">
                  <span>{member.fullName} <span className="text-muted">({member.email})</span></span>
                  {canManage && (
                    <button
                      className="text-danger text-xs hover:underline"
                      onClick={() => handleRemoveMember(team.id, member.id)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1" htmlFor="teamName">Team name</label>
            <input
              id="teamName"
              required
              maxLength={100}
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit">Create team</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!addMemberTeamId} onClose={() => setAddMemberTeamId(null)} title="Add member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1" htmlFor="userId">User</label>
            <select
              id="userId"
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setAddMemberTeamId(null)}>Cancel</Button>
            <Button type="submit">Add member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
