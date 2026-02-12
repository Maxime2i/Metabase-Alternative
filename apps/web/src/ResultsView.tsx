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
  showChartHint?: boolean;
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
    return (
      <div className="px-4 py-8 text-center text-slate-500 text-sm">
        No rows returned.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {cols.map((c) => (
              <th
                key={c}
                className="px-4 py-3 font-medium text-slate-700 capitalize"
              >
                {String(c).replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
              {cols.map((col) => (
                <td key={col} className="px-4 py-2.5 text-slate-800">
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

const CHART_COLOR = "#8b5cf6"; /* violet-500 */

export function ResultsView({
  rows,
  columns,
  chartType,
  showChartHint,
}: Props) {
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
    const showHint = showChartHint && chartType !== "table" && !canChart;
    if (showHint) {
      return (
        <div className="px-4 py-6 text-center text-sm text-slate-500">
          Bar & Line need a numeric column (e.g. “How many X per Y?”)
        </div>
      );
    }
    return <ResultsTable rows={rows} columns={columns} />;
  }

  const common = {
    data: chartData,
    margin: { top: 12, right: 12, left: 12, bottom: 12 },
  };

  if (chartType === "bar") {
    return (
      <div className="h-80 bg-slate-50/30 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />
            <Bar
              dataKey="value"
              fill={CHART_COLOR}
              name={String(cols[1]).replace(/_/g, " ")}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-80 bg-slate-50/30 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart {...common}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART_COLOR}
            name={String(cols[1]).replace(/_/g, " ")}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
