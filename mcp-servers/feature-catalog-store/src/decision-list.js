// Transforms a feature-catalog.json into a business-facing "feature decision
// list" workbook (feature-decision-list.xlsx) that non-technical users can
// discuss without a UI to decide, per feature, whether the to-be application
// should provide it. Screen/code fields are dropped; decision columns are left
// blank for the workshop. Works for frontend/backend/background catalogs via
// field fallbacks.

import ExcelJS from "exceljs";
import path from "node:path";
import fs from "node:fs";

// domain -> 업무영역(L1). Unknown domains pass through unchanged.
const L1_MAP = {
  // frontend
  Authentication: "인증·접근",
  Navigation: "공통·내비게이션",
  Application: "애플리케이션 컨텍스트",
  Document: "문서 관리",
  "OAS Authoring": "OpenAPI 편집",
  "Global Admin": "관리자 마스터관리",
  Preview: "미리보기·공유",
  System: "공통·시스템",
  // backend (business-ish already; mapped where a nicer label helps)
  Account: "인증·접근",
  Security: "인증·접근",
  Component: "컴포넌트 관리",
  Organization: "조직·사용자 관리",
  "Organization User": "조직·사용자 관리",
  User: "조직·사용자 관리",
  Parameter: "파라미터 관리",
};

// featureType values that are supporting/technical, not business features.
const NON_BUSINESS_TYPES = new Set([
  "AUTHORIZE", "NAVIGATION", "NOTIFY", "BACKGROUND",
  "AUDIT", "MONITOR", "CACHE", "SCHEDULE",
]);

const arr = (v) => (Array.isArray(v) ? v.join(", ") : v || "");

function mapRole(f) {
  const p = f.permission || f.authorization || f.authentication || "";
  if (!p) return "로그인 사용자";
  const s = String(p).toLowerCase();
  const r = [];
  if (s.includes("admin")) r.push("관리자");
  if (s.includes("writer")) r.push("작성자");
  if (s.includes("reader")) r.push("열람자");
  if (!r.length) {
    if (s.includes("세션") || s.includes("session") || s.includes("login")) return "로그인 사용자";
    if (s.includes("없") || s.includes("none") || s.includes("비로그인") || s.includes("public")) return "비로그인 허용";
    return String(p);
  }
  return r.join("/");
}

const asIs = (c) => (c === "HIGH" ? "제공됨" : c === "MEDIUM" ? "제공됨(부분확인)" : "확인필요");

const HEADERS = [
  "기능ID", "논의구분", "업무영역(L1)", "기능그룹(L2)", "기능명", "무엇을(기능설명)",
  "왜(목적·가치)", "주 사용자/역할", "대표시나리오", "데이터/산출물", "As-Is 제공여부",
  "To-Be 채택", "우선순위", "변경·개선 의견", "결정자", "결정일", "업무 제약/비고",
];
const WIDTHS = {
  "기능ID": 15, "논의구분": 11, "업무영역(L1)": 16, "기능그룹(L2)": 20, "기능명": 28,
  "무엇을(기능설명)": 54, "왜(목적·가치)": 24, "주 사용자/역할": 15, "대표시나리오": 22,
  "데이터/산출물": 26, "As-Is 제공여부": 14, "To-Be 채택": 12, "우선순위": 11,
  "변경·개선 의견": 24, "결정자": 10, "결정일": 12, "업무 제약/비고": 32,
};

function toRow(f) {
  return {
    "기능ID": f.featureId || "",
    "논의구분": NON_BUSINESS_TYPES.has(f.featureType) ? "공통·비기능" : "업무기능",
    "업무영역(L1)": L1_MAP[f.domain] || f.domain || "",
    "기능그룹(L2)": f.module || "",
    "기능명": f.featureName || "",
    "무엇을(기능설명)": f.description || "",
    "왜(목적·가치)": "",
    "주 사용자/역할": mapRole(f),
    "대표시나리오": arr(f.trigger),
    "데이터/산출물": arr(f.outputs || f.responseOutputs),
    "As-Is 제공여부": asIs(f.confidence),
    "To-Be 채택": "",
    "우선순위": "",
    "변경·개선 의견": "",
    "결정자": "",
    "결정일": "",
    "업무 제약/비고": f.permission || f.authorization || f.authentication || "",
  };
}

/**
 * Generate feature-decision-list.xlsx from a catalog file.
 * @param {string} catalogPath path to feature-catalog.json
 * @param {string} [outPath] output xlsx path (default: sibling feature-decision-list.xlsx)
 * @returns {Promise<{outPath:string, total:number, business:number, nonBusiness:number}>}
 */
export async function generateDecisionList(catalogPath, outPath) {
  const abs = path.resolve(catalogPath);
  const d = JSON.parse(fs.readFileSync(abs, "utf8"));
  const feats = Array.isArray(d) ? d : d.features || [];
  const systemName = (!Array.isArray(d) && d.systemName) || "";
  const analysisDate = (!Array.isArray(d) && d.analysisDate) || "";
  const out = outPath ? path.resolve(outPath) : path.join(path.dirname(abs), "feature-decision-list.xlsx");

  const rows = feats.map(toRow);
  const orderL1 = [...new Set(rows.map((r) => r["업무영역(L1)"]))];
  rows.sort((a, b) => {
    if (a.논의구분 !== b.논의구분) return a.논의구분 === "업무기능" ? -1 : 1;
    const ai = orderL1.indexOf(a["업무영역(L1)"]), bi = orderL1.indexOf(b["업무영역(L1)"]);
    if (ai !== bi) return ai - bi;
    return String(a.기능ID).localeCompare(String(b.기능ID));
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = "feature-catalog-store";

  // ---- 안내 ----
  const guide = wb.addWorksheet("안내");
  guide.columns = [{ width: 22 }, { width: 100 }];
  guide.addRow(["기능 결정 목록 (To-Be 채택 논의용)"]).font = { bold: true, size: 14 };
  guide.addRow([]);
  guide.addRow(["대상 시스템", systemName]);
  guide.addRow(["원본(as-is 근거)", "feature-catalog.json · 기능ID로 연결"]);
  guide.addRow(["분석일", analysisDate]);
  guide.addRow(["전체 기능 수", String(feats.length)]);
  guide.addRow([]);
  guide.addRow(["사용 방법"]).font = { bold: true };
  [
    "1) 각 기능의 [To-Be 채택]을 채택/제외/변경/보류 중 선택합니다(드롭다운).",
    "2) [우선순위]는 MoSCoW(Must/Should/Could/Won't)로 선택합니다.",
    "3) [왜(목적·가치)]·[변경·개선 의견]은 현업 논의 결과를 직접 기입합니다.",
    "4) [논의구분]='공통·비기능'은 기술 동작으로 채택 논의 대상이 아니라 정보성입니다.",
    "5) 화면·코드 용어 없이 업무 관점으로 작성되었습니다. 기술 근거는 기능ID로 feature-catalog.json에서 확인합니다.",
    "6) 이 파일은 분석 완료 시 feature-catalog.json에서 자동 생성됩니다. 수동 편집분은 재생성 시 덮어써질 수 있습니다.",
  ].forEach((t) => guide.addRow(["", t]));

  // ---- 기능결정목록 ----
  const ws = wb.addWorksheet("기능결정목록", { views: [{ state: "frozen", ySplit: 1, xSplit: 1 }] });
  ws.columns = HEADERS.map((h) => ({ header: h, key: h, width: WIDTHS[h] || 16 }));
  rows.forEach((r) => ws.addRow(r));

  const hr = ws.getRow(1);
  hr.font = { bold: true, color: { argb: "FFFFFFFF" } };
  hr.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  hr.height = 30;
  hr.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF375623" } }; });
  ws.autoFilter = { from: "A1", to: { row: 1, column: HEADERS.length } };

  const ci = (n) => HEADERS.indexOf(n) + 1;
  const cKind = ci("논의구분"), cAdopt = ci("To-Be 채택"), cPrio = ci("우선순위"), cAsis = ci("As-Is 제공여부");
  for (let i = 2; i <= ws.rowCount; i++) {
    const row = ws.getRow(i);
    row.alignment = { vertical: "top", wrapText: true };
    row.eachCell((c) => {
      c.border = { top: { style: "hair" }, bottom: { style: "hair" }, left: { style: "hair" }, right: { style: "hair" } };
    });
    const isNon = row.getCell(cKind).value === "공통·비기능";
    if (isNon) row.eachCell((c) => { c.font = { color: { argb: "FF808080" } }; });
    else if (i % 2 === 0) row.eachCell((c) => { if (!c.fill || c.fill.type !== "pattern") c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F7EE" } }; });
    const asisCell = row.getCell(cAsis);
    if (asisCell.value === "확인필요") asisCell.font = { color: { argb: "FFC00000" }, bold: true };
    ws.getCell(i, cAdopt).dataValidation = { type: "list", allowBlank: true, formulae: ['"채택,제외,변경,보류"'] };
    ws.getCell(i, cPrio).dataValidation = { type: "list", allowBlank: true, formulae: ['"Must,Should,Could,Won\'t"'] };
  }

  // ---- 요약 ----
  const sum = wb.addWorksheet("요약");
  sum.columns = [{ width: 22 }, { width: 12 }, { width: 12 }, { width: 12 }];
  sum.addRow(["업무영역별 기능 수"]).font = { bold: true, size: 12 };
  sum.addRow(["업무영역(L1)", "업무기능", "공통·비기능", "합계"]).font = { bold: true };
  const agg = {};
  rows.forEach((r) => {
    const k = r["업무영역(L1)"]; agg[k] = agg[k] || { b: 0, n: 0 };
    if (r.논의구분 === "업무기능") agg[k].b++; else agg[k].n++;
  });
  orderL1.forEach((k) => sum.addRow([k, agg[k].b, agg[k].n, agg[k].b + agg[k].n]));
  const tb = rows.filter((r) => r.논의구분 === "업무기능").length;
  sum.addRow(["합계", tb, rows.length - tb, rows.length]).font = { bold: true };
  sum.addRow([]);
  sum.addRow(["결정 현황"]).font = { bold: true };
  const last = rows.length + 1;
  [["채택", "채택"], ["제외", "제외"], ["변경", "변경"], ["보류", "보류"]].forEach(([lbl, v]) =>
    sum.addRow([lbl, `=COUNTIF(기능결정목록!L2:L${last},"${v}")`]));
  sum.addRow(["미정(공란)", `=COUNTBLANK(기능결정목록!L2:L${last})`]);

  await wb.xlsx.writeFile(out);
  return { outPath: out, total: rows.length, business: tb, nonBusiness: rows.length - tb };
}
