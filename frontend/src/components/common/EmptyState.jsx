export default function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-16 border border-dashed border-panelBorder rounded-lg">
      <p className="text-slate-200 font-medium">{title}</p>
      {description && <p className="text-muted text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
