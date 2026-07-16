// Standalone DB bootstrap: creates the schema, then exits.
// Usage: npm run init-db   (from mcp-servers/feature-catalog-store)

import { getPool, initSchema } from "./db.js";
import { loadConfig } from "./config.js";

try {
  const { database, configPath } = loadConfig();
  await initSchema();
  console.log(
    `Schema ready. Connection: ${
      database.connectionString ? "connectionString" : "PG* env vars"
    }${configPath ? ` (config: ${configPath})` : ""}`
  );
  await getPool().end();
} catch (err) {
  console.error(`init-db failed: ${err.message}`);
  process.exit(1);
}
