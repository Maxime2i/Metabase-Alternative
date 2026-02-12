import { useState, useEffect } from "react";
import {
  runQuery,
  listReports,
  createReport,
  getReport,
  updateReport,
  deleteReport,
  type Report,
} from "./api";
import { ResultsView } from "./ResultsView";
import { ResultsSkeleton } from "./ResultsSkeleton";

type ChartType = "table" | "bar" | "line";

const EXAMPLE_QUESTIONS = [
  "List all doctors with their specialty and facility name",
  "How many patients does each facility have?",
  "Show visits with doctor and patient names",
];

export default function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    rows: Record<string, unknown>[];
    columns?: string[];
    sql?: string;
    truncated?: boolean;
    rowCount: number;
  } | null>(null);
  const [chartType, setChartType] = useState<ChartType>("table");
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [saveName, setSaveName] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

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
        truncated: data.truncated,
        rowCount: data.rowCount ?? data.rows.length,
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
        truncated: data.truncated,
        rowCount: data.rowCount ?? data.rows.length,
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

  function startRenameReport(r: Report) {
    setEditingReportId(r.id);
    setEditingName(r.name);
  }

  function cancelRenameReport() {
    setEditingReportId(null);
    setEditingName("");
  }

  async function handleRenameReport(e: React.FormEvent, id: number) {
    e.preventDefault();
    if (!editingName.trim()) return;
    try {
      const updated = await updateReport(id, { name: editingName.trim() });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      cancelRenameReport();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename report");
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
            Metabase Alternative
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Ask questions in plain English about the US clinic database.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Main content */}
          <main className="min-w-0 flex-1 space-y-5">
            {/* Query card */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <label
                htmlFor="query-input"
                className="mb-2 block font-medium text-slate-700"
              >
                Your question:
              </label>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                  id="query-input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. List all doctors with their specialty and facility name"
                  rows={2}
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500 sm:text-sm"
                  disabled={loading}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Running…
                      </>
                    ) : (
                      "Run query"
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Example questions when no result yet */}
            {!result && !loading && (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="mb-2 text-sm font-medium text-slate-600">
                  Try asking
                </p>
                <ul className="space-y-1.5">
                  {EXAMPLE_QUESTIONS.map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        onClick={() => setQuestion(q)}
                        className="text-left text-sm text-violet-600 hover:underline"
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <span className="mt-0.5 text-red-500" aria-hidden>
                  ⚠
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <section className="space-y-4 transition-results">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-5 w-14 rounded bg-slate-200 skeleton-pulse" />
                  <div className="h-8 w-32 rounded-lg bg-slate-100" />
                </div>
                <ResultsSkeleton />
              </section>
            )}

            {/* Results */}
            {result && (
              <section className="space-y-4 transition-results">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">
                      View as
                    </span>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                      {(["table", "bar", "line"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setChartType(t)}
                          className={`transition-view rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
                            chartType === t
                              ? "bg-white text-violet-600 shadow-md scale-[1.02]"
                              : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">
                      {result.rowCount} row
                      {result.rowCount !== 1 ? "s" : ""}
                      {result.truncated ? " (truncated)" : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSaveOpen(true)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Save report
                  </button>
                </div>

                {saveOpen && (
                  <form
                    onSubmit={handleSaveReport}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Report name"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!saveName.trim()}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSaveOpen(false);
                        setSaveName("");
                      }}
                      className="rounded-lg bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {result.sql && (
                  <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <summary className="cursor-pointer text-sm font-medium text-slate-600">
                      Generated SQL
                    </summary>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                      {result.sql}
                    </pre>
                  </details>
                )}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <ResultsView
                    rows={result.rows}
                    columns={result.columns}
                    chartType={chartType}
                    showChartHint={true}
                  />
                </div>
              </section>
            )}
          </main>

          {/* Sidebar - Saved reports */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0 lg:min-w-0">
            <div className="sticky top-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                Saved reports
              </h2>
              {reportsLoading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : reports.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  No saved reports. Run a query and click “Save report”.
                </p>
              ) : (
                <ul className="space-y-2">
                  {reports.map((r) => (
                    <li
                      key={r.id}
                      className="transition-card rounded-lg border border-slate-100 bg-slate-50/50 p-2 shadow-sm hover:bg-white hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
                    >
                      {editingReportId === r.id ? (
                        <form
                          onSubmit={(e) => handleRenameReport(e, r.id)}
                          className="flex flex-col gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <button
                              type="submit"
                              disabled={!editingName.trim()}
                              className="rounded bg-violet-600 px-2 py-1 text-xs text-white hover:bg-violet-700 disabled:opacity-50"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={cancelRenameReport}
                              className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => runReport(r.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              runReport(r.id);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="min-w-0 flex-1 text-left text-sm font-medium text-violet-600 truncate">
                              {r.name}
                            </span>
                            <div
                              className="flex items-center gap-0.5 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startRenameReport(r);
                                }}
                                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                                title="Rename"
                              >
                                <span className="sr-only">Rename</span>✎
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReport(r.id);
                                }}
                                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                title="Delete"
                              >
                                <span className="sr-only">Delete</span>×
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
