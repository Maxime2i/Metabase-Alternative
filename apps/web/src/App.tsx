import { useState, useEffect } from "react";
import {
  runQuery,
  listReports,
  createReport,
  getReport,
  deleteReport,
  type Report,
} from "./api";
import { ResultsView } from "./ResultsView";

type ChartType = "table" | "bar" | "line";

export default function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    rows: Record<string, unknown>[];
    columns?: string[];
    sql?: string;
  } | null>(null);
  const [chartType, setChartType] = useState<ChartType>("table");
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [saveName, setSaveName] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    listReports()
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setReportsLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runQuery(question.trim());
      if ("error" in data) {
        setError(data.error);
        return;
      }
      setResult({
        rows: data.rows,
        columns: data.columns,
        sql: data.sql,
      });
    } finally {
      setLoading(false);
    }
  }

  function loadReport(r: Report) {
    setQuestion(r.question);
    setChartType((r.chartType as ChartType) || "table");
    setError(null);
    setResult(null);
  }

  async function runReport(id: number) {
    const r = await getReport(id);
    loadReport(r);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runQuery(r.question);
      if ("error" in data) {
        setError(data.error);
        return;
      }
      setResult({
        rows: data.rows,
        columns: data.columns,
        sql: data.sql,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveReport(e: React.FormEvent) {
    e.preventDefault();
    if (!saveName.trim() || !question.trim()) return;
    try {
      const created = await createReport({
        name: saveName.trim(),
        question: question.trim(),
        chartType,
      });
      setReports((prev) => [created, ...prev]);
      setSaveName("");
      setSaveOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save report");
    }
  }

  async function handleDeleteReport(id: number) {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete report");
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Clinic Data</h1>
          <p className="mt-1 text-slate-600">
            Ask a question in plain English about the US clinic database.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 min-w-0">
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. List all doctors with their specialty and facility name"
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? "Running…" : "Run query"}
                </button>
              </div>
            </form>

            {result && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-600">
                  View:
                </span>
                {(["table", "bar", "line"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setChartType(t)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
                      chartType === t
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSaveOpen(true)}
                  className="ml-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Save report
                </button>
              </div>
            )}

            {saveOpen && (
              <form
                onSubmit={handleSaveReport}
                className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Report name"
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={!saveName.trim()}
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSaveOpen(false);
                    setSaveName("");
                  }}
                  className="rounded bg-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
              </form>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                {error}
              </div>
            )}

            {result && (
              <section className="space-y-4">
                {result.sql && (
                  <details className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                    <summary className="cursor-pointer text-sm font-medium text-slate-600">
                      Generated SQL
                    </summary>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                      {result.sql}
                    </pre>
                  </details>
                )}
                <ResultsView
                  rows={result.rows}
                  columns={result.columns}
                  chartType={chartType}
                />
              </section>
            )}
          </main>

          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">
                Saved reports
              </h2>
              {reportsLoading ? (
                <p className="text-slate-500 text-sm">Loading…</p>
              ) : reports.length === 0 ? (
                <p className="text-slate-500 text-sm italic">
                  No saved reports yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {reports.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-2 group"
                    >
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => runReport(r.id)}
                          className="text-left text-sm font-medium text-blue-600 hover:underline truncate block w-full"
                        >
                          {r.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => loadReport(r)}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          Load only
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(r.id)}
                        className="text-slate-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100"
                        title="Delete report"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
