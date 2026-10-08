import { beforeAll, describe, expect, it, vi } from "vitest";

const mongoMocks = vi.hoisted(() => ({
  command: vi.fn(),
  collection: vi.fn(),
  connect: vi.fn(),
  close: vi.fn(),
  db: vi.fn(),
  constructor: vi.fn(),
}));

vi.mock("mongodb", () => ({
  ServerApiVersion: { v1: "1" },
  MongoClient: function MockMongoClient(uri, options) {
    mongoMocks.constructor(uri, options);
    return {
      connect: mongoMocks.connect,
      close: mongoMocks.close,
      db: mongoMocks.db,
    };
  },
}));

let databaseModule;
const fakeCollection = { findOne: vi.fn() };
const fakeDatabase = {
  collection: mongoMocks.collection,
  command: mongoMocks.command,
};

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://database-user:private-password@localhost:27017";
  process.env.MONGODB_DB_NAME = "bloodDonationDB";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
  process.env.BETTER_AUTH_URL = "http://localhost:5000";
  process.env.CLIENT_URL = "http://localhost:5173";

  mongoMocks.connect.mockResolvedValue(undefined);
  mongoMocks.close.mockResolvedValue(undefined);
  mongoMocks.command.mockResolvedValue({ ok: 1 });
  mongoMocks.collection.mockReturnValue(fakeCollection);
  mongoMocks.db.mockReturnValue(fakeDatabase);

  databaseModule = await import("../src/config/db.js");
});

describe("MongoDB connection lifecycle", () => {
  it("reuses one client and one simultaneous connection attempt", async () => {
    const [firstDatabase, secondDatabase] = await Promise.all([
      databaseModule.connectToDatabase(),
      databaseModule.connectToDatabase(),
    ]);

    expect(firstDatabase).toBe(fakeDatabase);
    expect(secondDatabase).toBe(fakeDatabase);
    expect(mongoMocks.constructor).toHaveBeenCalledTimes(1);
    expect(mongoMocks.connect).toHaveBeenCalledTimes(1);
  });

  it("returns collections through the connected database", async () => {
    await expect(databaseModule.getCollection("profiles")).resolves.toBe(fakeCollection);
    expect(mongoMocks.collection).toHaveBeenCalledWith("profiles");
  });

  it("pings the configured database", async () => {
    await expect(databaseModule.pingDatabase()).resolves.toBe(true);
    expect(mongoMocks.command).toHaveBeenCalledWith({ ping: 1 });
  });

  it("sanitizes connection errors and permits a later retry", async () => {
    await databaseModule.closeDatabaseConnection();
    const connectionCallsBeforeFailure = mongoMocks.connect.mock.calls.length;
    mongoMocks.connect.mockRejectedValueOnce(
      new Error("failed mongodb://database-user:private-password@localhost:27017"),
    );

    const connectionError = await databaseModule.connectToDatabase().catch((error) => error);
    expect(connectionError).toMatchObject({
      name: "DatabaseConnectionError",
      code: "DATABASE_CONNECTION_ERROR",
    });
    expect(connectionError.message).not.toContain("private-password");

    await expect(databaseModule.connectToDatabase()).resolves.toBe(fakeDatabase);
    expect(mongoMocks.connect).toHaveBeenCalledTimes(connectionCallsBeforeFailure + 2);
  });
});
