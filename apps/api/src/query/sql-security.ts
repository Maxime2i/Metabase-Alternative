/**
 * Validates that the SQL string is a read-only SELECT query.
 * Rejects DDL, DML (INSERT/UPDATE/DELETE), dangerous keywords, and multi-statement.
 *
 * Multi-statement: only one command per request. Example of blocked attack:
 *   "SELECT 1; SELECT pg_sleep(100)"  → DoS by running a second statement
 *   "SELECT * FROM a; SELECT * FROM b" → we only want to run one query
 * So we reject any SQL that contains a semicolon except optionally one at the very end.
 */
const FORBIDDEN =
  /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|EXECUTE)\b/i;

export function isAllowedSql(sql: string): {
  allowed: boolean;
  reason?: string;
} {
  const trimmed = sql.trim();
  if (!trimmed) {
    return { allowed: false, reason: "Empty query" };
  }
  const upper = trimmed.toUpperCase();
  if (!upper.startsWith("SELECT")) {
    return { allowed: false, reason: "Only SELECT queries are allowed" };
  }
  if (FORBIDDEN.test(trimmed)) {
    return { allowed: false, reason: "Query contains forbidden statement(s)" };
  }
  const withoutTrailingSemicolon = trimmed.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) {
    return {
      allowed: false,
      reason:
        "Only a single SELECT statement is allowed (no semicolon-separated commands)",
    };
  }
  return { allowed: true };
}
