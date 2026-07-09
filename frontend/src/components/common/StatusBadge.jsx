const STYLES = {
  ACTIVE: 'bg-success/15 text-success border-success/30',
  ON_HOLD: 'bg-warning/15 text-warning border-warning/30',
  COMPLETED: 'bg-muted/15 text-muted border-muted/30',
  PLANNED: 'bg-signal/15 text-signal border-signal/30',
};

const LABELS = {
  ACTIVE: 'Active',
  ON_HOLD: 'On hold',
  COMPLETED: 'Completed',
  PLANNED: 'Planned',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STYLES[status] || STYLES.ACTIVE}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {LABELS[status] || status}
    </span>
  );
}
