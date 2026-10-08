import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createContactMessage: vi.fn() }));
vi.mock("../src/services/contact.service.js", () => ({
  createContactMessage: mocks.createContactMessage,
}));

import contactRouter from "../src/routes/contact.routes.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use("/api/v1/contacts", contactRouter);
app.use(errorHandler);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createContactMessage.mockResolvedValue({ _id: "contact-1" });
});

describe("contact API", () => {
  it("validates, normalizes, and stores a contact message", async () => {
    await request(app)
      .post("/api/v1/contacts")
      .send({
        name: "Visitor Name",
        email: "VISITOR@EXAMPLE.COM",
        message: "I would like more information.",
      })
      .expect(201);
    expect(mocks.createContactMessage).toHaveBeenCalledWith({
      name: "Visitor Name",
      email: "visitor@example.com",
      message: "I would like more information.",
    });
  });

  it("rejects invalid contact input", async () => {
    await request(app)
      .post("/api/v1/contacts")
      .send({ name: "A", email: "invalid", message: "short" })
      .expect(400);
    expect(mocks.createContactMessage).not.toHaveBeenCalled();
  });
});
