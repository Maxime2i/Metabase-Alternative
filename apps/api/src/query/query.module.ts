import { Module } from "@nestjs/common";
import { QueryController } from "./query.controller";
import { QueryService } from "./query.service";
import { LlmService } from "./llm.service";

@Module({
  controllers: [QueryController],
  providers: [QueryService, LlmService],
})
export class QueryModule {}
