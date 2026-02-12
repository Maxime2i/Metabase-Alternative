import { useState } from "react";
import { runQuery } from "./api";

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
                {c.replace(/_/g, " ")}
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

export default function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    rows: Record<string, unknown>[];
    columns?: string[];
    sql?: string;
  } | null>(null);

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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Clinic Data</h1>
          <p className="mt-1 text-slate-600">
            Ask a question in plain English about the US clinic database.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mb-6">
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
            <ResultsTable rows={result.rows} columns={result.columns} />
          </section>
        )}
      </div>
    </div>
  );
}
