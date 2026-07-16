// Loads analyst identity and database connection from a git-ignored local file.
//
// Resolution order for the config file:
//   1. process.env.ANALYST_CONFIG_PATH (explicit path)
//   2. `analyst.config.json` found by walking up from CWD to the filesystem root
//
// The file is intentionally NOT committed to git (see .gitignore). Each analyst
// creates it locally after cloning the workspace. See the workspace README.

import fs from "node:fs";
import path from "node:path";

const CONFIG_FILENAME = "analyst.config.json";

function findConfigFile() {
  if (process.env.ANALYST_CONFIG_PATH) {
    return process.env.ANALYST_CONFIG_PATH;
  }
  let dir = process.cwd();
  // Walk up to the filesystem root looking for the config file.
  for (;;) {
    const candidate = path.join(dir, CONFIG_FILENAME);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

let cached = null;

export function loadConfig() {
  if (cached) return cached;

  const configPath = findConfigFile();
  let fileConfig = {};
  if (configPath) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
      throw new Error(
        `Failed to parse analyst config at ${configPath}: ${err.message}`
      );
    }
  }

  const analyst = fileConfig.analyst || {};
  const database = fileConfig.database || {};

  // Environment variables override the file when present.
  const connectionString =
    database.connectionString || process.env.DATABASE_URL || null;

  cached = {
    configPath,
    analyst: {
      name: analyst.name || process.env.ANALYST_NAME || null,
      email: analyst.email || process.env.ANALYST_EMAIL || null,
      team: analyst.team || process.env.ANALYST_TEAM || null,
    },
    database: {
      // When connectionString is null, `pg` falls back to standard PG* env vars.
      connectionString,
    },
  };
  return cached;
}

export function requireAnalyst() {
  const { analyst, configPath } = loadConfig();
  if (!analyst.name) {
    throw new Error(
      "Analyst identity is not configured. Create `analyst.config.json` in the " +
        "workspace root (copy analyst.config.example.json) and set analyst.name. " +
        (configPath
          ? `Loaded config: ${configPath}`
          : "No analyst.config.json was found.")
    );
  }
  return analyst;
}
