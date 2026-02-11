import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE_DB } from "../db/db.module";
import { reports } from "../db/schema";
import { desc, eq } from "drizzle-orm";

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: typeof import("../db/index").db
  ) {}

  async findAll() {
    return this.db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async findOne(id: number) {
    const [row] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, id));
    if (!row) throw new NotFoundException(`Report ${id} not found`);
    return row;
  }

  async create(data: { name: string; question: string; chartType?: string }) {
    const [created] = await this.db
      .insert(reports)
      .values({
        name: data.name,
        question: data.question,
        chartType: data.chartType ?? null,
      })
      .returning();
    return created!;
  }

  async update(
    id: number,
    data: { name?: string; question?: string; chartType?: string }
  ) {
    const [updated] = await this.db
      .update(reports)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();
    if (!updated) throw new NotFoundException(`Report ${id} not found`);
    return updated;
  }

  async remove(id: number) {
    const [deleted] = await this.db
      .delete(reports)
      .where(eq(reports.id, id))
      .returning();
    if (!deleted) throw new NotFoundException(`Report ${id} not found`);
    return deleted;
  }
}
