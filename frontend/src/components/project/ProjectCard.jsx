import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-panel border border-panelBorder rounded-lg p-5 hover:border-signal transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-100">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      <p className="text-sm text-muted mt-2 line-clamp-2">{project.description || 'No description provided.'}</p>
      <div className="flex items-center justify-between mt-4 text-xs text-muted font-data">
        <span>{project.team ? project.team.name : 'No team assigned'}</span>
        <span>{project.milestoneDueDate ? `Due ${project.milestoneDueDate}` : 'No due date'}</span>
      </div>
    </Link>
  );
}
