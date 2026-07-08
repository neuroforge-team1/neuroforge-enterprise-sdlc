export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 text-muted text-sm py-8 justify-center">
      <span className="w-3 h-3 rounded-full bg-signal animate-pulse" aria-hidden="true" />
      {label}
    </div>
  );
}
