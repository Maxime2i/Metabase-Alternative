const API_BASE = "/api";

export type QueryResponse =
  | { rows: Record<string, unknown>[]; columns?: string[]; sql?: string }
  | { error: string };

export async function runQuery(question: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { error: data.message ?? data.error ?? "Request failed" };
  }
  if (data.error) return { error: data.error };
  return data as QueryResponse;
}
