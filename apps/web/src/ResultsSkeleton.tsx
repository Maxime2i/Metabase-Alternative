export function ResultsSkeleton() {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-in"
      aria-hidden
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {[1, 2, 3, 4].map((i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 w-20 rounded bg-slate-200 skeleton-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <tr key={i}>
                {[1, 2, 3, 4].map((j) => (
                  <td key={j} className="px-4 py-2.5">
                    <div
                      className="h-4 rounded bg-slate-100 skeleton-pulse"
                      style={{ width: `${60 + (i + j) * 8}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
