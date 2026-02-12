import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

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

  /** Max rows per page (1–1000). Used with offset for pagination. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;

  /** Row offset for pagination. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
