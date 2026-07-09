import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';
import { sprintService } from '../services/sprintService';
import { useAuthStore } from '../store/authStore';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/project/ProjectForm';
import Loader from '../components/common/Loader';

const SPRINT_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED'];
const PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED'];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [sprintOpen, setSprintOpen] = useState(false);
  const [sprintForm, setSprintForm] = useState({ name: '', startDate: '', endDate: '' });
  const [sprintError, setSprintError] = useState(null);
  const hasRole = useAuthStore((s) => s.hasRole);
  const canManage = hasRole('PROJECT_MANAGER') || hasRole('ADMIN');
  const canDelete = hasRole('ADMIN');
  const canPlanSprints = hasRole('PROJECT_MANAGER') || hasRole('ADMIN');
  const canMoveSprints = hasRole('DEVELOPER') || hasRole('PROJECT_MANAGER') || hasRole('ADMIN');
  const canSetStatus = hasRole('TESTER') || hasRole('PROJECT_MANAGER') || hasRole('ADMIN');

  const load = () => {
    projectService.getById(id).then(setProject).catch(() => setError('Project not found.'));
    teamService.getAll().then(setTeams).catch(() => {});
    sprintService.getForProject(id).then(setSprints).catch(() => {});
  };

  useEffect(load, [id]);

  const handleUpdate = async (values) => {
    const updated = await projectService.update(id, {
      ...values,
      teamId: values.teamId || null,
      milestoneDueDate: values.milestoneDueDate || null,
    });
    setProject(updated);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    await projectService.remove(id);
    navigate('/projects');
  };

  const handleStatusChange = async (status) => {
    const updated = await projectService.updateStatus(id, status);
    setProject(updated);
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    setSprintError(null);
    if (sprintForm.endDate < sprintForm.startDate) {
      setSprintError('End date cannot be before the start date.');
      return;
    }
    try {
      await sprintService.create({ ...sprintForm, projectId: id });
      setSprintForm({ name: '', startDate: '', endDate: '' });
      setSprintOpen(false);
      sprintService.getForProject(id).then(setSprints);
    } catch {
      setSprintError('Could not create the sprint.');
    }
  };

  const handleSprintStatus = async (sprintId, status) => {
    const updated = await sprintService.updateStatus(sprintId, status);
    setSprints((prev) => prev.map((s) => (s.id === sprintId ? updated : s)));
  };

  const nextSprintStatus = (status) => SPRINT_STATUSES[Math.min(SPRINT_STATUSES.indexOf(status) + 1, SPRINT_STATUSES.length - 1)];

  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!project) return <Loader label="Loading project…" />;

  return (
    <div className="max-w-3xl">
      <Link to="/projects" className="text-sm text-signal hover:underline">&larr; Back to projects</Link>

      <div className="flex items-start justify-between mt-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{project.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={project.status} />
            {canSetStatus && (
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-ink border border-panelBorder rounded-md px-2 py-1 text-xs text-slate-300"
                aria-label="Change project status"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ').toLowerCase()}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(true)}>Edit</Button>
            {canDelete && <Button variant="danger" onClick={handleDelete}>Delete</Button>}
          </div>
        )}
      </div>

      <p className="text-slate-300 mt-4">{project.description || 'No description provided.'}</p>

      <dl className="grid grid-cols-2 gap-4 mt-6 font-data text-sm">
        <div>
          <dt className="text-muted">Team</dt>
          <dd className="text-slate-100 mt-1">{project.team ? `${project.team.name} (${project.team.memberCount} members)` : 'Unassigned'}</dd>
        </div>
        <div>
          <dt className="text-muted">Milestone due date</dt>
          <dd className="text-slate-100 mt-1">{project.milestoneDueDate || 'Not set'}</dd>
        </div>
        <div>
          <dt className="text-muted">Created by</dt>
          <dd className="text-slate-100 mt-1">{project.createdBy?.fullName}</dd>
        </div>
        <div>
          <dt className="text-muted">Created</dt>
          <dd className="text-slate-100 mt-1">{new Date(project.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Sprints</h2>
          {canPlanSprints && <Button variant="ghost" onClick={() => setSprintOpen(true)}>New sprint</Button>}
        </div>

        {sprints.length === 0 && (
          <p className="text-muted text-sm">
            {canPlanSprints ? 'No sprints yet — create one to timebox the next chunk of work.' : 'No sprints yet.'}
          </p>
        )}

        <div className="space-y-3">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="bg-panel border border-panelBorder rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-100 font-medium">{sprint.name}</p>
                <p className="text-xs text-muted font-data mt-0.5">{sprint.startDate} → {sprint.endDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={sprint.status} />
                {canMoveSprints && sprint.status !== 'COMPLETED' && (
                  <Button
                    variant="ghost"
                    onClick={() => handleSprintStatus(sprint.id, nextSprintStatus(sprint.status))}
                  >
                    Mark {nextSprintStatus(sprint.status).toLowerCase()}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
        <ProjectForm
          initialValues={{
            name: project.name,
            description: project.description || '',
            teamId: project.team?.id || '',
            milestoneDueDate: project.milestoneDueDate || '',
            status: project.status,
          }}
          teams={teams}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Modal>

      <Modal open={sprintOpen} onClose={() => setSprintOpen(false)} title="New sprint">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          {sprintError && <p className="text-danger text-sm">{sprintError}</p>}
          <div>
            <label className="block text-sm text-slate-300 mb-1" htmlFor="sprintName">Sprint name</label>
            <input
              id="sprintName"
              required
              maxLength={150}
              value={sprintForm.name}
              onChange={(e) => setSprintForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
              placeholder="Sprint 1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1" htmlFor="sprintStart">Start date</label>
              <input
                id="sprintStart"
                type="date"
                required
                value={sprintForm.startDate}
                onChange={(e) => setSprintForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1" htmlFor="sprintEnd">End date</label>
              <input
                id="sprintEnd"
                type="date"
                required
                value={sprintForm.endDate}
                onChange={(e) => setSprintForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setSprintOpen(false)}>Cancel</Button>
            <Button type="submit">Create sprint</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
