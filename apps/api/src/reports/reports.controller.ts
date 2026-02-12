import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportDto } from "./dto/update-report.dto";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  list() {
    return this.reportsService.findAll();
  }

  @Get(":id")
  get(@Param("id", ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateReportDto) {
    return this.reportsService.create(body);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() body: UpdateReportDto) {
    return this.reportsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }
}
