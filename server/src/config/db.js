import { MongoClient, ServerApiVersion } from "mongodb";
import { getEnvironment } from "./env.js";

let client;
let connectionPromise;

export class DatabaseConnectionError extends Error {
  constructor(message = "Unable to connect to MongoDB") {
    super(message);
    this.name = "DatabaseConnectionError";
    this.code = "DATABASE_CONNECTION_ERROR";
  }
}

const createConnectionError = () =>
  new DatabaseConnectionError(
    "Unable to connect to MongoDB. Check MONGODB_URI, Atlas network access, and database credentials.",
  );

export const getMongoClient = () => {
  if (!client) {
    try {
      client = new MongoClient(getEnvironment().MONGODB_URI, {
        appName: "blood-donation-api",
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 60_000,
        waitQueueTimeoutMS: 10_000,
        serverSelectionTimeoutMS: 10_000,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: true,
        },
      });
    } catch {
      throw createConnectionError();
    }
  }

  return client;
};

export const getDatabase = () => getMongoClient().db(getEnvironment().MONGODB_DB_NAME);

export const connectToDatabase = async () => {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await getMongoClient().connect();
        return getDatabase();
      } catch {
        connectionPromise = undefined;
        throw createConnectionError();
      }
    })();
  }

  return connectionPromise;
};

export const getCollection = async (collectionName) => {
  const database = await connectToDatabase();
  return database.collection(collectionName);
};

export const pingDatabase = async () => {
  try {
    const database = await connectToDatabase();
    const result = await database.command({ ping: 1 });
    return result.ok === 1;
  } catch (error) {
    if (error instanceof DatabaseConnectionError) throw error;
    throw new DatabaseConnectionError("MongoDB ping failed");
  }
};

export const closeDatabaseConnection = async () => {
  if (!client) return;
  await client.close();
  client = undefined;
  connectionPromise = undefined;
};
