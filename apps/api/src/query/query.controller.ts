import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { QueryService } from "./query.service";
import { QueryDto } from "./dto/query.dto";

@Controller("query")
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async run(@Body() body: QueryDto) {
    const hasSql = body.sql != null && body.sql.trim() !== "";
    const hasQuestion = body.question != null && body.question.trim() !== "";
    if (!hasSql && !hasQuestion) {
      throw new BadRequestException(
        "Provide either 'sql' or 'question' in body"
      );
    }
    if (hasSql && hasQuestion) {
      throw new BadRequestException("Provide only one of 'sql' or 'question'");
    }
    try {
      if (hasSql) {
        return await this.queryService.runQuery(body.sql!);
      }
      return await this.queryService.runNaturalLanguage(body.question!);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Query failed";
      throw new BadRequestException(message);
    }
  }
}
