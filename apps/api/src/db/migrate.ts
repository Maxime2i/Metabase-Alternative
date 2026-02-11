import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/clinic";

function ensureDatabase(dbName: string): Promise<void> {
  const urlToPostgres = connectionString.replace(/\/[^/]*$/, "/postgres");
  const pool = new pg.Pool({ connectionString: urlToPostgres });
  return pool
    .query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName])
    .then((res) => {
      if (res.rowCount === 0) {
        return pool.query(`CREATE DATABASE "${dbName}"`).then(() => {
          console.log(`Database "${dbName}" created.`);
        });
      }
    })
    .finally(() => pool.end());
}

async function run() {
  const dbName = (connectionString.match(/\/([^/?#]+)(\?|#|$)/) ?? [
    null,
    "clinic",
  ])[1];
  await ensureDatabase(dbName);

  const pool = new pg.Pool({ connectionString });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await pool.end();
  console.log("Migrations applied.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
