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
  create(@Body() body: { name: string; question: string; chartType?: string }) {
    return this.reportsService.create(body);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { name?: string; question?: string; chartType?: string }
  ) {
    return this.reportsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }
}
