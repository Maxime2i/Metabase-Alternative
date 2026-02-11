import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE_POOL } from "../db/db.module";
import type { Pool } from "pg";
import { isAllowedSql } from "./sql-security";
import { LlmService } from "./llm.service";

@Injectable()
export class QueryService {
  constructor(
    @Inject(DRIZZLE_POOL) private readonly pool: Pool,
    private readonly llmService: LlmService
  ) {}

  async runQuery(
    sql: string
  ): Promise<{ rows: unknown[]; columns?: string[] }> {
    const { allowed, reason } = isAllowedSql(sql);
    if (!allowed) {
      throw new Error(reason ?? "Query not allowed");
    }
    const result = await this.pool.query(sql);
    const columns =
      result.fields?.length > 0 ? result.fields.map((f) => f.name) : undefined;
    return { rows: result.rows ?? [], columns };
  }

  async runNaturalLanguage(
    question: string
  ): Promise<{ rows: unknown[]; columns?: string[]; sql?: string }> {
    const sql = await this.llmService.questionToSql(question);
    const result = await this.runQuery(sql);
    return { ...result, sql };
  }
}
