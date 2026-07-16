# Project Instructions

## Project

이 저장소는 Vue 3, TypeScript, Vite 및 Bootstrap 기반 프론트엔드
애플리케이션이다.

## Repository scope

저장소 루트는 현재 작업 디렉터리 하단 ./inputs/oas-doc-ui 이다.

주요 분석 대상:

- `src/`
- `public/`
- `package.json`
- `vite.config.ts`

기본 제외 대상:

- `node_modules/`
- `dist/`
- `coverage/`
- `.git/`
- 생성 코드와 번들 파일

## General rules

- 기존 애플리케이션 소스를 명시적 요청 없이 수정하지 않는다.
- 파일을 직접 확인하지 않은 내용을 사실로 단정하지 않는다.
- 추정한 내용은 `confidence: LOW`와 함께 기록한다.
- 파일명만 보고 기능을 확정하지 않는다.
- 화면, 이벤트, API, 상태 변경 및 권한 근거를 교차 확인한다.
- 분석 결과에는 항상 파일 경로와 코드 심볼을 포함한다.
- 주석 처리되거나 미사용으로 판단되는 코드는 운영 기능과 구분한다.

## Feature analysis

프론트엔드 기능 분석 요청을 받으면
`frontend-feature-analysis` Skill을 사용한다.

대규모 전체 저장소 분석은 가능한 경우
`frontend-feature-analyst` 서브에이전트에 위임한다.

## Output location

기능 분석 결과는 다음 경로에 작성한다.

- `frontend-analysis-output/repository-inventory.md`
- `frontend-analysis-output/feature-catalog.json`
- `frontend-analysis-output/feature-catalog.md`
- `frontend-analysis-output/feature-evidence.md`
- `frontend-analysis-output/coverage-report.md`
- `frontend-analysis-output/unresolved-items.md`

분석을 위해 애플리케이션 원본 파일을 변경하지 않는다.
