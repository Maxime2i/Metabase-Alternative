import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/clinic";

export const pool = new pg.Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
