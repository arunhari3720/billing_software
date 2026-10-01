export default function StatCard({ label, value, icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
