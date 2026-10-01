export default function Table({ columns, data, empty = "No records found" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className="px-5 py-3">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row, i) => (
            <tr
              key={row._id || i}
              className="border-b border-slate-800/70 hover:bg-slate-800/20"
            >
              {columns.map((c) => (
                <td key={c.key} className="px-5 py-3 text-slate-300">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!data?.length && (
        <div className="p-8 text-center text-sm text-slate-600">{empty}</div>
      )}
    </div>
  );
}
