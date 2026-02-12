
export function applyLimitOffset(
  sql: string,
  limit: number,
  offset: number
): string {
  const trimmed = sql.trim().replace(/;\s*$/, "");
  const hasLimit = /\bLIMIT\s+\d+/i.test(trimmed);
  if (hasLimit) {
    return trimmed;
  }
  return `${trimmed} LIMIT ${Math.floor(limit)} OFFSET ${Math.floor(offset)}`;
}
