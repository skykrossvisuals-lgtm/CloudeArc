// Load environment variables from .env.local before anything else
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../../.env.local") });

import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { setupCollab } from "./collab";

// Prefer API_PORT for the API server; fallback to PORT; default to 3000 if none set
const rawPort = process.env["API_PORT"] ?? process.env["PORT"] ?? "3000";

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);
setupCollab(httpServer);

httpServer.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
