export default function Button({ variant = 'primary', children, className = '', ...props }) {
  const base = 'px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-signal text-white hover:bg-blue-600',
    ghost: 'bg-transparent text-slate-200 border border-panelBorder hover:bg-panel',
    danger: 'bg-danger text-white hover:bg-red-600',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
