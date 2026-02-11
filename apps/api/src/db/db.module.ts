import { Global, Module } from "@nestjs/common";
import { db, pool } from "./index";

export const DRIZZLE_DB = Symbol("DRIZZLE_DB");
export const DRIZZLE_POOL = Symbol("DRIZZLE_POOL");

@Global()
@Module({
  providers: [
    { provide: DRIZZLE_DB, useValue: db },
    { provide: DRIZZLE_POOL, useValue: pool },
  ],
  exports: [DRIZZLE_DB, DRIZZLE_POOL],
})
export class DbModule {}
