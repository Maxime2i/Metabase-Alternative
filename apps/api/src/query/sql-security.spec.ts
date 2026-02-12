import { isAllowedSql } from "./sql-security";

describe("isAllowedSql", () => {
  it("allows simple SELECT", () => {
    expect(isAllowedSql("SELECT * FROM organizations")).toEqual({
      allowed: true,
    });
  });

  it("allows SELECT with trailing semicolon", () => {
    expect(isAllowedSql("SELECT id FROM doctors;")).toEqual({ allowed: true });
  });

  it("allows SELECT with JOIN and WHERE", () => {
    expect(
      isAllowedSql(
        "SELECT d.first_name, f.name FROM doctors d JOIN facilities f ON d.facility_id = f.id WHERE d.specialty = 'Cardiology'"
      )
    ).toEqual({ allowed: true });
  });

  it("rejects empty query", () => {
    expect(isAllowedSql("")).toEqual({
      allowed: false,
      reason: "Empty query",
    });
    expect(isAllowedSql("   ")).toEqual({
      allowed: false,
      reason: "Empty query",
    });
  });

  it("rejects non-SELECT statements", () => {
    expect(isAllowedSql("INSERT INTO orgs (name) VALUES ('x')")).toEqual({
      allowed: false,
      reason: "Only SELECT queries are allowed",
    });
    expect(isAllowedSql("UPDATE organizations SET name = 'x'")).toEqual({
      allowed: false,
      reason: "Only SELECT queries are allowed",
    });
    expect(isAllowedSql("DELETE FROM visits")).toEqual({
      allowed: false,
      reason: "Only SELECT queries are allowed",
    });
  });

  it("rejects dangerous keywords", () => {
    expect(
      isAllowedSql("SELECT * FROM organizations; DROP TABLE organizations")
    ).toEqual({
      allowed: false,
      reason: "Query contains forbidden statement(s)",
    });
    expect(
      isAllowedSql("SELECT * FROM organizations; TRUNCATE visits")
    ).toEqual({
      allowed: false,
      reason: "Query contains forbidden statement(s)",
    });
    expect(
      isAllowedSql("SELECT 1; ALTER TABLE doctors ADD COLUMN x INT")
    ).toEqual({
      allowed: false,
      reason: "Query contains forbidden statement(s)",
    });
  });

  it("rejects CREATE", () => {
    expect(isAllowedSql("CREATE TABLE foo (id INT)")).toEqual({
      allowed: false,
      reason: "Only SELECT queries are allowed",
    });
  });

  it("is case insensitive for forbidden keywords", () => {
    expect(
      isAllowedSql("select * from organizations; drop table orgs")
    ).toEqual({
      allowed: false,
      reason: "Query contains forbidden statement(s)",
    });
  });

  it("rejects multi-statement (only one SELECT per request)", () => {
    expect(isAllowedSql("SELECT 1; SELECT 2")).toEqual({
      allowed: false,
      reason:
        "Only a single SELECT statement is allowed (no semicolon-separated commands)",
    });
    expect(
      isAllowedSql("SELECT * FROM doctors; SELECT * FROM patients")
    ).toEqual({
      allowed: false,
      reason:
        "Only a single SELECT statement is allowed (no semicolon-separated commands)",
    });
  });
});
