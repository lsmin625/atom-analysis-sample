// Auto-extracts system / application / repository / scope metadata from the
// analyzed source code and the produced feature-catalog.json. Nothing here is
// asked from the caller when it can be derived from the source itself.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

function gitField(cwd, args) {
  try {
    return execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim() || null;
  } catch {
    return null;
  }
}

// --- Repository (VCS) metadata, extracted from the analyzed source repo -------
export function extractRepository(sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return { url: null, branch: null, commit: null, toplevel: null };
  }
  return {
    url: gitField(sourcePath, ["config", "--get", "remote.origin.url"]),
    branch: gitField(sourcePath, ["rev-parse", "--abbrev-ref", "HEAD"]),
    commit: gitField(sourcePath, ["rev-parse", "HEAD"]),
    toplevel: gitField(sourcePath, ["rev-parse", "--show-toplevel"]),
  };
}

// --- Application coordinates, extracted from build manifests ------------------
function parsePom(xml) {
  // Remove blocks whose <artifactId>/<version> are NOT the project's own.
  const stripped = xml
    .replace(/<parent>[\s\S]*?<\/parent>/g, "")
    .replace(/<dependencyManagement>[\s\S]*?<\/dependencyManagement>/g, "")
    .replace(/<dependencies>[\s\S]*?<\/dependencies>/g, "")
    .replace(/<build>[\s\S]*?<\/build>/g, "");
  const pick = (tag) => {
    const m = stripped.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
    return m ? m[1].trim() : null;
  };
  return { groupId: pick("groupId"), artifactId: pick("artifactId"), version: pick("version") };
}

export function extractApplication(sourcePath) {
  if (!sourcePath) return { name: null, version: null, kind: "unknown", group: null };

  const pkgPath = path.join(sourcePath, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      return { name: pkg.name || null, version: pkg.version || null, kind: "node", group: null };
    } catch {
      /* fall through */
    }
  }

  const pomPath = path.join(sourcePath, "pom.xml");
  if (fs.existsSync(pomPath)) {
    try {
      const { groupId, artifactId, version } = parsePom(fs.readFileSync(pomPath, "utf8"));
      return { name: artifactId, version, kind: "maven", group: groupId };
    } catch {
      /* fall through */
    }
  }

  const gradlePath = fs.existsSync(path.join(sourcePath, "build.gradle"))
    ? path.join(sourcePath, "build.gradle")
    : path.join(sourcePath, "build.gradle.kts");
  if (fs.existsSync(gradlePath)) {
    try {
      const txt = fs.readFileSync(gradlePath, "utf8");
      const version = (txt.match(/version\s*=?\s*['"]([^'"]+)['"]/) || [])[1] || null;
      const group = (txt.match(/group\s*=?\s*['"]([^'"]+)['"]/) || [])[1] || null;
      return { name: path.basename(sourcePath), version, kind: "gradle", group };
    } catch {
      /* fall through */
    }
  }

  return { name: path.basename(sourcePath), version: null, kind: "unknown", group: null };
}

// --- Catalog-derived metadata -------------------------------------------------
export function readCatalog(catalogPath) {
  const raw = fs.readFileSync(catalogPath, "utf8");
  const json = JSON.parse(raw);
  const features = Array.isArray(json) ? json : json.features || [];
  const contentHash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, json, features, contentHash };
}

export function extractSystemName(catalog) {
  if (!Array.isArray(catalog) && catalog.systemName) return catalog.systemName;
  // Fall back to the most frequent per-feature systemName, if present.
  const features = Array.isArray(catalog) ? catalog : catalog.features || [];
  const counts = {};
  for (const f of features) {
    if (f && f.systemName) counts[f.systemName] = (counts[f.systemName] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length ? sorted[0][0] : null;
}

// Distinct 2-segment path prefixes across every feature's sourceFiles.
// Concretely answers "which part of the repository was analyzed".
export function extractAnalyzedPaths(features) {
  const set = new Set();
  for (const f of features) {
    const files = (f && f.sourceFiles) || [];
    for (const file of files) {
      if (typeof file !== "string") continue;
      const segs = file.split("/").filter(Boolean);
      set.add(segs.slice(0, 2).join("/") || file);
    }
  }
  return [...set].sort();
}

export function inferAnalysisType(catalogPath, override) {
  if (override) return override;
  const dir = path.dirname(path.resolve(catalogPath)).replace(/\\/g, "/");
  const m = dir.match(/outputs\/(frontend|backend|background)-analysis-output$/);
  return m ? m[1] : null;
}
