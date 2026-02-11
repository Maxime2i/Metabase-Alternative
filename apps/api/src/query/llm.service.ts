import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { CLINIC_SCHEMA_CONTEXT } from "./schema-context";

const SYSTEM_PROMPT = `You are a SQL expert. Given a natural language question about a US clinic database, return exactly one valid PostgreSQL SELECT query, nothing else. No markdown, no explanation. Use only the tables and columns described in the schema.`;

@Injectable()
export class LlmService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async questionToSql(question: string): Promise<string> {
    if (!this.client) {
      throw new Error(
        "OPENAI_API_KEY is not set. Set it in apps/api/.env to use natural language queries."
      );
    }
    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + "\n\nSchema:\n" + CLINIC_SCHEMA_CONTEXT,
        },
        { role: "user", content: question },
      ],
      temperature: 0.1,
    });
    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("LLM did not return any SQL");
    }
    return content;
  }
}
