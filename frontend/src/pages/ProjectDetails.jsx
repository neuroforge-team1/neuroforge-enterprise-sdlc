import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';
import { useAuthStore } from '../store/authStore';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/project/ProjectForm';
import Loader from '../components/common/Loader';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const hasRole = useAuthStore((s) => s.hasRole);
  const canManage = hasRole('PROJECT_MANAGER') || hasRole('ADMIN');
  const canDelete = hasRole('ADMIN');

  const load = () => {
    projectService.getById(id).then(setProject).catch(() => setError('Project not found.'));
    teamService.getAll().then(setTeams).catch(() => {});
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

  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!project) return <Loader label="Loading project…" />;

  return (
    <div className="max-w-2xl">
      <Link to="/projects" className="text-sm text-signal hover:underline">&larr; Back to projects</Link>

      <div className="flex items-start justify-between mt-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{project.name}</h1>
          <div className="mt-2"><StatusBadge status={project.status} /></div>
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
    </div>
  );
}
