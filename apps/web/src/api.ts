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

export type Report = {
  id: number;
  name: string;
  question: string;
  chartType: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listReports(): Promise<Report[]> {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error("Failed to load reports");
  return res.json();
}

export async function getReport(id: number): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) throw new Error("Failed to load report");
  return res.json();
}

export async function createReport(data: {
  name: string;
  question: string;
  chartType?: string;
}): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save report");
  return res.json();
}

export async function deleteReport(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/reports/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete report");
}
