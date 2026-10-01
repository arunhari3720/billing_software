export default function Toast({ message, type = "error" }) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-5 right-5 z-[60] rounded-xl border px-4 py-3 text-sm shadow-xl ${type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}
    >
      {message}
    </div>
  );
}
