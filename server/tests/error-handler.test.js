import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler.js";

const app = express();
app.get("/failure", async () => {
  throw new Error("database password: do-not-expose");
});
app.use(errorHandler);

describe("production-safe errors", () => {
  it("does not expose internal error details", async () => {
    const response = await request(app).get("/failure").expect(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal server error",
      errors: [],
    });
    expect(JSON.stringify(response.body)).not.toContain("do-not-expose");
  });
});
