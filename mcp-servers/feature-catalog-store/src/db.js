// PostgreSQL persistence for feature-catalog analysis results.

import pg from "pg";
import { loadConfig } from "./config.js";

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (pool) return pool;
  const { database } = loadConfig();
  // When connectionString is null, node-postgres uses the standard PG* env vars
  // (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE).
  pool = database.connectionString
    ? new Pool({ connectionString: database.connectionString })
    : new Pool();
  return pool;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS feature_catalog_analysis (
  id                  BIGSERIAL PRIMARY KEY,
  system_name         TEXT NOT NULL,
  application_name    TEXT,
  application_version TEXT,
  application_kind    TEXT,
  application_group   TEXT,
  analysis_type       TEXT,
  repository_url      TEXT,
  repository_branch   TEXT,
  repository_commit   TEXT,
  repository_root     TEXT,
  analyzed_scope      TEXT,
  analyzed_paths      TEXT[],
  analyst_name        TEXT NOT NULL,
  analyst_email       TEXT,
  analyst_team        TEXT,
  analyzed_at         TIMESTAMPTZ,
  version             INTEGER NOT NULL,
  content_hash        TEXT NOT NULL,
  feature_count       INTEGER,
  catalog             JSONB NOT NULL,
  saved_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (system_name, application_name, analysis_type, version)
);
CREATE INDEX IF NOT EXISTS idx_fca_lookup
  ON feature_catalog_analysis (system_name, application_name, analysis_type);
CREATE INDEX IF NOT EXISTS idx_fca_hash
  ON feature_catalog_analysis (content_hash);
`;

export async function initSchema() {
  await getPool().query(SCHEMA_SQL);
}

// Inserts one analysis record, computing the next artifact version for the
// (system, application, scope) triple under a transaction-scoped advisory lock
// so concurrent saves cannot collide on the version number.
export async function saveCatalog(record) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    // Version increments per stable target = (system, application, analysis type).
    // analyzed_scope is recorded but NOT part of the key, so a changed source-file
    // set (e.g. one more feature) still counts as the same target's next version.
    const lockKey = `${record.systemName}||${record.applicationName}||${record.analysisType}`;
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [lockKey]);

    const { rows: verRows } = await client.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS next
         FROM feature_catalog_analysis
        WHERE system_name = $1
          AND application_name IS NOT DISTINCT FROM $2
          AND analysis_type IS NOT DISTINCT FROM $3`,
      [record.systemName, record.applicationName, record.analysisType]
    );
    const version = verRows[0].next;

    const { rows } = await client.query(
      `INSERT INTO feature_catalog_analysis (
         system_name, application_name, application_version, application_kind,
         application_group, analysis_type, repository_url, repository_branch,
         repository_commit, repository_root, analyzed_scope, analyzed_paths,
         analyst_name, analyst_email, analyst_team, analyzed_at, version,
         content_hash, feature_count, catalog
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
       )
       RETURNING id, version, saved_at`,
      [
        record.systemName,
        record.applicationName,
        record.applicationVersion,
        record.applicationKind,
        record.applicationGroup,
        record.analysisType,
        record.repositoryUrl,
        record.repositoryBranch,
        record.repositoryCommit,
        record.repositoryRoot,
        record.analyzedScope,
        record.analyzedPaths,
        record.analystName,
        record.analystEmail,
        record.analystTeam,
        record.analyzedAt,
        version,
        record.contentHash,
        record.featureCount,
        record.catalog,
      ]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
