import { useState, useEffect } from "react";
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

const PAGE_SIZES = [25, 50, 100, 200] as const;

function formatCellValue(val: unknown): string {
  if (val == null) return "";
  const str = typeof val === "string" ? val.trim() : "";
  if (str && /^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(str)) {
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) {
      const hasTime =
        /T\d{2}:\d{2}/.test(str) || /T\d{2}:\d{2}:\d{2}/.test(str);
      return hasTime
        ? d.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : d.toLocaleDateString(undefined, { dateStyle: "medium" });
    }
  }
  if (typeof val === "object" && "toISOString" in (val as object)) {
    const d = val as Date;
    if (!Number.isNaN(d.getTime()))
      return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
  }
  return String(val);
}

function ResultsTable({
  rows,
  columns,
}: {
  rows: Record<string, unknown>[];
  columns?: string[];
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const cols = columns ?? (rows[0] ? Object.keys(rows[0] as object) : []);
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  useEffect(() => {
    const scrollToBottom = () => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    };
    requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));
  }, [currentPage, pageSize]);

  if (rows.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-slate-500 text-sm">
        No rows returned.
      </div>
    );
  }
  return (
    <div className="flex flex-col">
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
            {pageRows.map((row, i) => (
              <tr
                key={start + i}
                className={
                  (start + i) % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }
              >
                {cols.map((col) => (
                  <td key={col} className="px-4 py-2.5 text-slate-800">
                    {formatCellValue((row as Record<string, unknown>)[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(totalPages > 1 || total > PAGE_SIZES[0]) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-2 text-sm">
          <span className="text-slate-600">
            Rows {start + 1}–{Math.min(start + pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-slate-600">
              Per page
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-800"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="flex items-center px-2 text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
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
        <div className="animate-in px-4 py-6 text-center text-sm text-slate-500">
          Bar & Line need a numeric column (e.g. “How many X per Y?”)
        </div>
      );
    }
    return (
      <div className="animate-in">
        <ResultsTable rows={rows} columns={columns} />
      </div>
    );
  }

  const common = {
    data: chartData,
    margin: { top: 12, right: 12, left: 12, bottom: 12 },
  };

  if (chartType === "bar") {
    return (
      <div className="animate-in h-80 bg-slate-50/30 p-4">
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
    <div className="animate-in h-80 bg-slate-50/30 p-4">
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
