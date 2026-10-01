export default function Select({ label, children, ...p }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select className="input" {...p}>
        {children}
      </select>
    </label>
  );
}
