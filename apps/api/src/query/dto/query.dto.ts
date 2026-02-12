import { IsOptional, IsString, MaxLength } from "class-validator";

export class QueryDto {
  /** Raw SQL (only SELECT allowed). */
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  sql?: string;

  /** Natural language question (requires OPENAI_API_KEY). */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  question?: string;
}
