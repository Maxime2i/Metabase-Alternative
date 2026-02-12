import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE_POOL } from "../db/db.module";
import type { Pool } from "pg";
import { isAllowedSql } from "./sql-security";
import { LlmService } from "./llm.service";
import { applyLimitOffset } from "./query-utils";

const DEFAULT_QUERY_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_ROWS = 1000;
const DEFAULT_LIMIT = 100;

export type QueryOptions = {
  limit?: number;
  offset?: number;
};

export type QueryResult = {
  rows: unknown[];
  columns?: string[];
  truncated?: boolean;
  rowCount: number;
};

@Injectable()
export class QueryService {
  private readonly timeoutMs: number;
  private readonly maxRows: number;

  constructor(
    @Inject(DRIZZLE_POOL) private readonly pool: Pool,
    private readonly llmService: LlmService
  ) {
    this.timeoutMs =
      parseInt(process.env.QUERY_TIMEOUT_MS ?? "", 10) ||
      DEFAULT_QUERY_TIMEOUT_MS;
    this.maxRows =
      parseInt(process.env.QUERY_MAX_ROWS ?? "", 10) || DEFAULT_MAX_ROWS;
  }

  async runQuery(
    sql: string,
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    const { allowed, reason } = isAllowedSql(sql);
    if (!allowed) {
      throw new Error(reason ?? "Query not allowed");
    }

    const limit = options.limit;
    const offset = Math.max(0, options.offset ?? 0);
    const sqlToRun =
      limit != null && limit > 0 ? applyLimitOffset(sql, limit, offset) : sql;

    const client = await this.pool.connect();
    try {
      await client.query({
        text: `SET statement_timeout = ${this.timeoutMs}`,
      });
      const result = await client.query(sqlToRun);
      const columns =
        result.fields?.length > 0
          ? result.fields.map((f) => f.name)
          : undefined;
      let rows = result.rows ?? [];
      let truncated = false;
      if (rows.length > this.maxRows) {
        rows = rows.slice(0, this.maxRows);
        truncated = true;
      }
      return {
        rows,
        columns,
        truncated: truncated || false,
        rowCount: rows.length,
      };
    } catch (err: unknown) {
      const pgErr = err as { code?: string; message?: string };
      if (pgErr?.code === "57014") {
        throw new Error(
          `Query timed out after ${
            this.timeoutMs / 1000
          } seconds. Try a simpler query or increase QUERY_TIMEOUT_MS.`
        );
      }
      if (err instanceof Error) {
        throw new Error(`Database error: ${err.message}`);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async runNaturalLanguage(
    question: string,
    options: QueryOptions = {}
  ): Promise<QueryResult & { sql?: string }> {
    let sql: string;
    try {
      sql = await this.llmService.questionToSql(question);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Natural language query failed";
      throw new Error(
        message.includes("OPENAI_API_KEY")
          ? message
          : `Natural language query failed: ${message}`
      );
    }
    const result = await this.runQuery(sql, options);
    return { ...result, sql };
  }
}
