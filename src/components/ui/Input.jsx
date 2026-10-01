export default function Input({ label, ...p }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input className="input" {...p} />
    </label>
  );
}
