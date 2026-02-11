import { Module } from "@nestjs/common";
import { DbModule } from "./db/db.module";
import { QueryModule } from "./query/query.module";
import { ReportsModule } from "./reports/reports.module";

@Module({
  imports: [DbModule, QueryModule, ReportsModule],
})
export class AppModule {}
