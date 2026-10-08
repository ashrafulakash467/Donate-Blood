import { beforeAll, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectToDatabase: vi.fn(),
  initializeIndexes: vi.fn(),
  listen: vi.fn(),
}));
let startServer;
vi.mock("../src/config/db.js", () => ({ connectToDatabase: mocks.connectToDatabase }));
vi.mock("../src/config/indexes.js", () => ({ initializeIndexes: mocks.initializeIndexes }));
vi.mock("../src/config/env.js", () => ({ getEnvironment: () => ({ PORT: 5050 }) }));
vi.mock("../src/app.js", () => ({ default: { listen: mocks.listen } }));

beforeAll(async () => {
  process.env.PORT = "5050";
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
  process.env.MONGODB_DB_NAME = "bloodDonationTest";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
  process.env.BETTER_AUTH_URL = "http://localhost:5050";
  process.env.CLIENT_URL = "http://localhost:5173";
  mocks.connectToDatabase.mockResolvedValue({});
  mocks.initializeIndexes.mockResolvedValue({});
  mocks.listen.mockImplementation((_port, callback) => callback());
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  ({ startServer } = await import("../src/index.js"));
});

describe("local server startup", () => {
  it("connects, initializes indexes, and starts exactly one local listener", async () => {
    await startServer();
    expect(console.error).not.toHaveBeenCalled();
    expect(mocks.connectToDatabase).toHaveBeenCalledTimes(1);
    expect(mocks.initializeIndexes).toHaveBeenCalledTimes(1);
    expect(mocks.listen).toHaveBeenCalledWith(5050, expect.any(Function));
  });
});
