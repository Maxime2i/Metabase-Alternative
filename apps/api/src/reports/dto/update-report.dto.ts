import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: "name must not be empty" })
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: "question must not be empty" })
  question?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  chartType?: string;
}
