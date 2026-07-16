// MCP server: feature-catalog-store
//
// Exposes a single tool, `save_feature_catalog`, that an analysis agent calls
// once analysis is complete. It reads the produced feature-catalog.json, auto-
// extracts system / application / repository / scope metadata from the source,
// stamps analyst + datetime + version, and stores the record in PostgreSQL.

import fs from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { requireAnalyst } from "./config.js";
import { initSchema, saveCatalog } from "./db.js";
import {
  readCatalog,
  extractRepository,
  extractApplication,
  extractSystemName,
  extractAnalyzedPaths,
  inferAnalysisType,
} from "./extract.js";

const server = new McpServer({ name: "feature-catalog-store", version: "1.0.0" });

server.tool(
  "save_feature_catalog",
  "Store a completed feature-catalog.json into the local PostgreSQL database. " +
    "System, application and repository metadata are auto-extracted from the " +
    "analyzed source; analyst identity comes from the local analyst.config.json. " +
    "Call this once an analysis run has produced feature-catalog.json.",
  {
    catalogPath: z
      .string()
      .describe("Path to the produced feature-catalog.json (absolute, or relative to the workspace root)."),
    sourcePath: z
      .string()
      .optional()
      .describe("Path to the analyzed application source root (a git repo). Defaults to the catalog's repositoryRoot."),
    analysisType: z
      .enum(["frontend", "backend", "background"])
      .optional()
      .describe("Analysis type. Defaults to inference from the output directory name."),
    analyzedScope: z
      .string()
      .optional()
      .describe("Which part of the repository was analyzed (e.g. 'src/', 'src/main/java'). Defaults to derived source paths."),
  },
  async ({ catalogPath, sourcePath, analysisType, analyzedScope }) => {
    try {
      const analyst = requireAnalyst();

      const catalogAbs = path.resolve(catalogPath);
      if (!fs.existsSync(catalogAbs)) {
        throw new Error(`feature-catalog.json not found at: ${catalogAbs}`);
      }

      const { json, features, contentHash } = readCatalog(catalogAbs);

      // Default the analyzed source root to the catalog's own repositoryRoot.
      const repoRootHint =
        sourcePath || (!Array.isArray(json) && json.repositoryRoot) || null;
      const sourceAbs = repoRootHint ? path.resolve(repoRootHint) : null;

      const repo = extractRepository(sourceAbs);
      const app = extractApplication(sourceAbs);
      const systemName = extractSystemName(json) || app.name || "UNKNOWN";
      const analyzedPaths = extractAnalyzedPaths(features);
      const resolvedType = inferAnalysisType(catalogAbs, analysisType);

      const scope =
        analyzedScope ||
        (analyzedPaths.length ? analyzedPaths.join(", ") : repoRootHint) ||
        null;

      const analysisDate =
        (!Array.isArray(json) && json.analysisDate) || null;

      await initSchema();

      const saved = await saveCatalog({
        systemName,
        applicationName: app.name,
        applicationVersion: app.version,
        applicationKind: app.kind,
        applicationGroup: app.group,
        analysisType: resolvedType,
        repositoryUrl: repo.url,
        repositoryBranch: repo.branch,
        repositoryCommit: repo.commit,
        repositoryRoot: repoRootHint,
        analyzedScope: scope,
        analyzedPaths,
        analystName: analyst.name,
        analystEmail: analyst.email,
        analystTeam: analyst.team,
        analyzedAt: analysisDate, // TIMESTAMPTZ accepts a 'YYYY-MM-DD' date string
        contentHash,
        featureCount: features.length,
        catalog: json,
      });

      const summary = [
        `Saved feature catalog (id=${saved.id}, version=${saved.version}).`,
        `- system: ${systemName}`,
        `- application: ${app.name}${app.version ? ` @ ${app.version}` : ""} (${app.kind})`,
        `- repository: ${repo.url || "n/a"} @ ${repo.commit ? repo.commit.slice(0, 10) : "n/a"} (${repo.branch || "n/a"})`,
        `- analysisType: ${resolvedType || "n/a"}`,
        `- analyzedScope: ${scope || "n/a"}`,
        `- analyst: ${analyst.name}${analyst.email ? ` <${analyst.email}>` : ""}`,
        `- analyzedAt: ${analysisDate || "n/a"}, savedAt: ${saved.saved_at.toISOString()}`,
        `- features: ${features.length}, contentHash: ${contentHash.slice(0, 12)}…`,
      ].join("\n");

      return { content: [{ type: "text", text: summary }] };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `save_feature_catalog failed: ${err.message}` }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
