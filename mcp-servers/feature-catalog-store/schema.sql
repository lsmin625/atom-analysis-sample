-- Schema for storing feature-catalog analysis results.
-- The MCP server also applies this automatically (CREATE TABLE IF NOT EXISTS)
-- on startup / first save. This file is provided for manual provisioning.
--
--   createdb feature_catalog
--   psql -d feature_catalog -f schema.sql

CREATE TABLE IF NOT EXISTS feature_catalog_analysis (
  id                  BIGSERIAL PRIMARY KEY,
  system_name         TEXT NOT NULL,          -- 어떤 시스템 (catalog.systemName)
  application_name    TEXT,                   -- 어떤 애플리케이션 (package.json / pom.xml)
  application_version TEXT,
  application_kind    TEXT,                   -- node | maven | gradle | unknown
  application_group   TEXT,                   -- maven/gradle groupId
  analysis_type       TEXT,                   -- frontend | backend | background
  repository_url      TEXT,                   -- 어떤 저장소 (git remote origin)
  repository_branch   TEXT,
  repository_commit   TEXT,
  repository_root     TEXT,
  analyzed_scope      TEXT,                   -- 어느 부분 (analyzed paths)
  analyzed_paths      TEXT[],
  analyst_name        TEXT NOT NULL,          -- 분석가 (analyst.config.json)
  analyst_email       TEXT,
  analyst_team        TEXT,
  analyzed_at         TIMESTAMPTZ,            -- 분석 일시 (catalog.analysisDate)
  version             INTEGER NOT NULL,       -- 분석 결과 저장물 버전 (per target, 1..n)
  content_hash        TEXT NOT NULL,          -- sha256(feature-catalog.json)
  feature_count       INTEGER,
  catalog             JSONB NOT NULL,         -- 저장물: feature-catalog.json 전체
  saved_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (system_name, application_name, analyzed_scope, version)
);

CREATE INDEX IF NOT EXISTS idx_fca_lookup
  ON feature_catalog_analysis (system_name, application_name, analyzed_scope);

CREATE INDEX IF NOT EXISTS idx_fca_hash
  ON feature_catalog_analysis (content_hash);
