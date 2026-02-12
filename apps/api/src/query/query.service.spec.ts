import { Test, TestingModule } from "@nestjs/testing";
import { QueryService } from "./query.service";
import { DRIZZLE_POOL } from "../db/db.module";
import { LlmService } from "./llm.service";

describe("QueryService", () => {
  let service: QueryService;
  let poolQuery: jest.Mock;

  const mockPool = {
    query: jest.fn(),
  };

  const mockLlmService = {
    questionToSql: jest.fn(),
  };

  beforeEach(async () => {
    poolQuery = mockPool.query as jest.Mock;
    poolQuery.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryService,
        { provide: DRIZZLE_POOL, useValue: mockPool },
        { provide: LlmService, useValue: mockLlmService },
      ],
    }).compile();

    service = module.get<QueryService>(QueryService);
  });

  describe("runQuery", () => {
    it("executes allowed SQL and returns rows and columns", async () => {
      poolQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: "Org 1" }],
        fields: [{ name: "id" }, { name: "name" }],
      });

      const result = await service.runQuery(
        "SELECT id, name FROM organizations"
      );

      expect(poolQuery).toHaveBeenCalledWith(
        "SELECT id, name FROM organizations"
      );
      expect(result).toEqual({
        rows: [{ id: 1, name: "Org 1" }],
        columns: ["id", "name"],
      });
    });

    it("throws when SQL is not allowed", async () => {
      await expect(
        service.runQuery("DELETE FROM organizations")
      ).rejects.toThrow("Only SELECT queries are allowed");

      expect(poolQuery).not.toHaveBeenCalled();
    });

    it("returns empty columns when no fields", async () => {
      poolQuery.mockResolvedValueOnce({ rows: [], fields: [] });

      const result = await service.runQuery("SELECT 1");

      expect(result.rows).toEqual([]);
      expect(result.columns).toBeUndefined();
    });
  });

  describe("runNaturalLanguage", () => {
    it("calls LLM then runs returned SQL", async () => {
      mockLlmService.questionToSql.mockResolvedValueOnce(
        "SELECT * FROM doctors LIMIT 1"
      );
      poolQuery.mockResolvedValueOnce({
        rows: [{ id: 1, first_name: "John" }],
        fields: [{ name: "id" }, { name: "first_name" }],
      });

      const result = await service.runNaturalLanguage("List one doctor");

      expect(mockLlmService.questionToSql).toHaveBeenCalledWith(
        "List one doctor"
      );
      expect(poolQuery).toHaveBeenCalledWith("SELECT * FROM doctors LIMIT 1");
      expect(result).toMatchObject({
        rows: [{ id: 1, first_name: "John" }],
        columns: ["id", "first_name"],
        sql: "SELECT * FROM doctors LIMIT 1",
      });
    });
  });
});
