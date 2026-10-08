import "dotenv/config";
import { getEnvironment } from "../src/config/env.js";
import app from "../src/app.js";

getEnvironment();

export default app;
