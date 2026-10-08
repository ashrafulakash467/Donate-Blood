import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { connectToDatabase } from "./config/db.js";
import { getEnvironment } from "./config/env.js";
import { initializeIndexes } from "./config/indexes.js";

export const startServer = async () => {
  try {
    const { PORT } = getEnvironment();
    const { default: app } = await import("./app.js");
    await connectToDatabase();
    await initializeIndexes();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup error";
    console.error(`Failed to start server: ${message}`);
    process.exitCode = 1;
  }
};

const isDirectExecution = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) await startServer();
