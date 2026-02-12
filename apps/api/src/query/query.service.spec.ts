import { Test, TestingModule } from "@nestjs/testing";
import { QueryService } from "./query.service";
import { DRIZZLE_POOL } from "../db/db.module";
import { LlmService } from "./llm.service";

describe("QueryService", () => {
  let service: QueryService;
  let clientQuery: jest.Mock;
  let clientRelease: jest.Mock;

  const mockPool = {
    connect: jest.fn(),
  };

  const mockLlmService = {
    questionToSql: jest.fn(),
  };

  beforeEach(async () => {
    clientQuery = jest.fn();
    clientRelease = jest.fn();
    (mockPool.connect as jest.Mock).mockClear();
    (mockPool.connect as jest.Mock).mockResolvedValue({
      query: clientQuery,
      release: clientRelease,
    });

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
    it("sets statement_timeout, executes allowed SQL and returns rows and columns", async () => {
      clientQuery.mockResolvedValueOnce(undefined).mockResolvedValueOnce({
        rows: [{ id: 1, name: "Org 1" }],
        fields: [{ name: "id" }, { name: "name" }],
      });

      const result = await service.runQuery(
        "SELECT id, name FROM organizations"
      );

      expect(mockPool.connect).toHaveBeenCalled();
      expect(clientQuery).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          text: expect.stringContaining("statement_timeout"),
        })
      );
      expect(clientQuery).toHaveBeenNthCalledWith(
        2,
        "SELECT id, name FROM organizations"
      );
      expect(clientRelease).toHaveBeenCalled();
      expect(result).toMatchObject({
        rows: [{ id: 1, name: "Org 1" }],
        columns: ["id", "name"],
        rowCount: 1,
      });
    });

    it("throws when SQL is not allowed", async () => {
      await expect(
        service.runQuery("DELETE FROM organizations")
      ).rejects.toThrow("Only SELECT queries are allowed");

      expect(mockPool.connect).not.toHaveBeenCalled();
    });

    it("returns truncated and rowCount when over maxRows", async () => {
      const manyRows = Array.from({ length: 1500 }, (_, i) => ({ id: i }));
      clientQuery
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ rows: manyRows, fields: [{ name: "id" }] });

      const result = await service.runQuery("SELECT id FROM organizations");

      expect(result.rows).toHaveLength(1000);
      expect(result.truncated).toBe(true);
      expect(result.rowCount).toBe(1000);
    });

    it("applies limit and offset when provided", async () => {
      clientQuery.mockResolvedValueOnce(undefined).mockResolvedValueOnce({
        rows: [{ id: 2 }],
        fields: [{ name: "id" }],
      });

      await service.runQuery("SELECT id FROM doctors", {
        limit: 10,
        offset: 1,
      });

      expect(clientQuery).toHaveBeenNthCalledWith(
        2,
        "SELECT id FROM doctors LIMIT 10 OFFSET 1"
      );
    });
  });

  describe("runNaturalLanguage", () => {
    it("calls LLM then runs returned SQL", async () => {
      mockLlmService.questionToSql.mockResolvedValueOnce(
        "SELECT * FROM doctors LIMIT 1"
      );
      clientQuery.mockResolvedValueOnce(undefined).mockResolvedValueOnce({
        rows: [{ id: 1, first_name: "John" }],
        fields: [{ name: "id" }, { name: "first_name" }],
      });

      const result = await service.runNaturalLanguage("List one doctor");

      expect(mockLlmService.questionToSql).toHaveBeenCalledWith(
        "List one doctor"
      );
      expect(result).toMatchObject({
        rows: [{ id: 1, first_name: "John" }],
        columns: ["id", "first_name"],
        sql: "SELECT * FROM doctors LIMIT 1",
      });
    });
  });
});
