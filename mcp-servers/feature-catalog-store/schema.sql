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
  -- 버전 키는 안정적인 대상 식별자 (system, application, analysis_type).
  -- analyzed_scope 는 기록만 하고 버전 키에 포함하지 않는다(파일 집합 변동에 영향받지 않도록).
  UNIQUE (system_name, application_name, analysis_type, version)
);

CREATE INDEX IF NOT EXISTS idx_fca_lookup
  ON feature_catalog_analysis (system_name, application_name, analysis_type);

CREATE INDEX IF NOT EXISTS idx_fca_hash
  ON feature_catalog_analysis (content_hash);
