---
name: oas-doc-ui-analysis
description: Baseline facts for analyzing the inputs/oas-doc-ui frontend (OpenAPI 3.0 authoring portal)
metadata:
  type: project
---

`inputs/oas-doc-ui` is a Vue 3 + TS + Vite + Bootstrap SPA: an OpenAPI 3.0 document authoring/management portal. Backend is `inputs/oas-doc-api` (out of analysis scope; only cross-referenced for API contracts).

**Why:** This is a recurring feature-analysis target ("atom-analysis-sample"). Re-discovery is expensive; these anchors speed future passes.

**How to apply (verify against current code first — this is a point-in-time snapshot):**
- Output goes to `outputs/frontend-analysis-output/` (path defined by the frontend-feature-analysis skill).
- Scale anchor: ~71 source files (60 Vue + 11 TS), baseline of ~73 identified features across domains AUTH/NAV/APP/DOC/OAS(document content authoring)/GLB(admin master data)/PRV/SYS.
- No Pinia — state is reactive-module singletons (`oas-document.ts`, `oas-application.ts`, `session.ts`) plus reactive-Map registries (`store-popups.ts`, `store-callbacks.ts`). Don't grep for defineStore.
- No tests, no i18n, no setInterval/WebSocket/EventSource/window.print. Don't spend time hunting these.
- Roles: ADMIN/WRITER/READER via `session.ts` (isAdmin/isWriter); guards in `router.ts` + onMounted role checks in AdminMain/WriterMain.
- Known suspicious spots to re-check: `ApplicationDocuments.deleteApplicationDocument` references undefined `stateApplication.documentIds`; `popToast`/`session.hasApplication` appear unused; `/logout` redirect target isn't a router route (backend-handled).
