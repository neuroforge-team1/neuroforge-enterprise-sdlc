import { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import ProjectCard from '../components/project/ProjectCard';
import ProjectForm from '../components/project/ProjectForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export default function Projects() {
  const { projects, loading, error, setProjects, setLoading, setError, upsertProject } = useProjectStore();
  const [teams, setTeams] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const hasRole = useAuthStore((s) => s.hasRole);
  const canManage = hasRole('PROJECT_MANAGER') || hasRole('ADMIN');

  useEffect(() => {
    setLoading(true);
    Promise.all([projectService.getAll(), teamService.getAll()])
      .then(([projectList, teamList]) => {
        setProjects(projectList);
        setTeams(teamList);
      })
      .catch(() => setError('Could not load projects.'));
  }, []);

  const handleCreate = async (values) => {
    const created = await projectService.create({
      ...values,
      teamId: values.teamId || null,
      milestoneDueDate: values.milestoneDueDate || null,
    });
    upsertProject(created);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Projects</h1>
          <p className="text-muted mt-1">All projects tracked in NeuroForge Nexus.</p>
        </div>
        {canManage && <Button onClick={() => setModalOpen(true)}>New project</Button>}
      </div>

      {loading && <Loader label="Loading projects…" />}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description={canManage ? 'Create your first project to get started.' : 'Ask a project manager to create one.'}
          action={canManage && <Button onClick={() => setModalOpen(true)}>New project</Button>}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create project">
        <ProjectForm teams={teams} onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
