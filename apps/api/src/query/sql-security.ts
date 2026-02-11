/**
 * Validates that the SQL string is a read-only SELECT query.
 * Rejects DDL, DML (INSERT/UPDATE/DELETE), and dangerous keywords.
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
  return { allowed: true };
}
