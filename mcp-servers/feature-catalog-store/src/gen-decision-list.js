// CLI: generate feature-decision-list.xlsx from a feature-catalog.json.
// Usage: node src/gen-decision-list.js <catalogPath> [outPath]
// Example: node src/gen-decision-list.js outputs/oas-doc-ui/feature-catalog.json

import { generateDecisionList } from "./decision-list.js";

const [, , catalogPath, outPath] = process.argv;
if (!catalogPath) {
  console.error("Usage: node src/gen-decision-list.js <catalogPath> [outPath]");
  process.exit(1);
}

try {
  const r = await generateDecisionList(catalogPath, outPath);
  console.log(`WROTE ${r.outPath}`);
  console.log(`rows: ${r.total} | 업무기능: ${r.business} | 공통·비기능: ${r.nonBusiness}`);
} catch (err) {
  console.error(`gen-decision-list failed: ${err.message}`);
  process.exit(1);
}
