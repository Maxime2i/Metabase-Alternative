import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type Props = {
  rows: Record<string, unknown>[];
  columns?: string[];
  chartType: "table" | "bar" | "line";
};

function ResultsTable({
  rows,
  columns,
}: {
  rows: Record<string, unknown>[];
  columns?: string[];
}) {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0] as object) : []);
  if (rows.length === 0) {
    return <p className="text-slate-500 italic py-4">No rows returned.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 font-medium">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-4 py-3 text-slate-700 capitalize">
                {String(c).replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              {cols.map((col) => (
                <td key={col} className="px-4 py-2 text-slate-800">
                  {String((row as Record<string, unknown>)[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function numericVal(x: unknown): number | null {
  if (typeof x === "number" && !Number.isNaN(x)) return x;
  if (typeof x === "string") {
    const n = Number(x);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function ResultsView({ rows, columns, chartType }: Props) {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0] as object) : []);
  const canChart =
    cols.length >= 2 &&
    rows.length > 0 &&
    rows.every(
      (r) => numericVal((r as Record<string, unknown>)[cols[1]]) !== null
    );
  const chartData = canChart
    ? rows.map((r) => ({
        name: String((r as Record<string, unknown>)[cols[0]] ?? ""),
        value: numericVal((r as Record<string, unknown>)[cols[1]]) ?? 0,
      }))
    : [];

  if (chartType === "table" || !canChart) {
    return <ResultsTable rows={rows} columns={columns} />;
  }

  const common = {
    data: chartData,
    margin: { top: 8, right: 8, left: 8, bottom: 8 },
  };

  if (chartType === "bar") {
    return (
      <div className="h-80 rounded-lg border border-slate-200 bg-white p-4 shadow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="#3b82f6"
              name={String(cols[1]).replace(/_/g, " ")}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-80 rounded-lg border border-slate-200 bg-white p-4 shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart {...common}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            name={String(cols[1]).replace(/_/g, " ")}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
