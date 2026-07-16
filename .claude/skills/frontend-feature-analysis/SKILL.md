---
name: frontend-feature-analysis
description: >
  Analyze a frontend repository and produce a complete, evidence-based
  application feature catalog. Use this skill when asked to identify screens,
  menus, user actions, CRUD functions, API-backed functions, permissions,
  validation, uploads, downloads, printing, background behavior, or feature
  coverage from Vue, React, Angular, or other frontend source code.
---

# Frontend Feature Analysis

## Objective

프론트엔드 저장소를 분석하여 애플리케이션이 제공하는 기능을
사용자 및 업무 관점의 구조화된 기능 목록으로 작성한다.

단순 화면 목록이나 컴포넌트 목록을 작성하지 않는다.

## Required references

분석을 시작하기 전에 다음 파일을 읽는다.

- `feature-schema.md`
- `validation-checklist.md`
- 저장소 루트의 `CLAUDE.md`

파일이 존재하지 않으면 현재 문서에 정의된 최소 규칙으로 진행하고
누락된 참조 문서를 unresolved 항목으로 기록한다.

## Analysis phases

반드시 다음 순서로 수행한다.

1. 기술 구조 파악
2. 저장소 인벤토리 생성
3. 라우트 및 메뉴 분석
4. 페이지와 컴포넌트 분석
5. 사용자 이벤트 분석
6. API와 상태 저장소 분석
7. 권한과 검증 분석
8. 기능 후보 통합
9. 근거 추적표 작성
10. 누락 검증
11. 커버리지 계산
12. 최종 산출물 생성

단일 파일 탐색 결과만으로 최종 목록을 작성하지 않는다.

## Feature identification sources

다음 근거를 모두 확인한다.

- route
- menu
- page and view
- component
- button and link
- tab and row action
- form submission
- event handler
- API service
- state store action
- permission condition
- validation rule
- modal and drawer
- upload and download
- export and print
- page-load behavior
- timer and polling
- WebSocket and EventSource
- test scenario
- i18n message
- application configuration

## Vue-specific patterns

다음 패턴을 검색한다.

- `createRouter`
- `addRoute`
- `router.push`
- `router.replace`
- `RouterLink`
- `import.meta.glob`
- `defineAsyncComponent`
- `defineEmits`
- `emit`
- `@click`
- `@submit`
- `@change`
- `@update:modelValue`
- `v-if`
- `v-show`
- `v-model`
- `onMounted`
- `watch`
- `watchEffect`
- `window.open`
- `window.print`
- `FormData`
- `Blob`
- `setInterval`
- `WebSocket`
- `EventSource`
- `axios`
- `fetch`
- `defineStore`
- `storeToRefs`
- `$patch`

## Feature granularity

다음처럼 사용자 목적과 결과가 다르면 별도 기능으로 분리한다.

- 목록 조회
- 조건 검색
- 상세 조회
- 등록
- 수정
- 삭제
- 승인
- 반려
- 상태 변경
- 업로드
- 다운로드
- 내보내기
- 인쇄

동일한 업무 기능이 메뉴, 라우트, 컴포넌트 및 API에 중복해서
나타나면 하나로 통합하고 근거를 여러 개 연결한다.

## Evidence requirement

각 기능에는 최소 하나 이상의 근거를 기록한다.

가능하면 다음 근거 조합을 확보한다.

- 화면 또는 라우트 근거
- 사용자 이벤트 근거
- API 또는 상태 변경 근거

각 근거에 다음을 기록한다.

- evidenceType
- filePath
- symbol
- lineRange
- description

## Confidence

- `HIGH`: 화면 이벤트와 API 또는 상태 변경이 확인됨
- `MEDIUM`: 화면 또는 API 중 일부 근거만 확인됨
- `LOW`: 구조와 명칭을 통한 추정이며 실행 근거가 부족함

## Coverage gate

최종 완료 전에 다음을 계산한다.

- route coverage
- page coverage
- API function coverage
- user-event coverage
- permission-condition coverage
- test-scenario coverage

커버리지가 100%가 아니면 미분류 항목을 전부
`unresolved-items.md`에 기록한다.

## Output

다음 파일을 생성한다.

- `analysis-output/repository-inventory.md`
- `analysis-output/feature-catalog.json`
- `analysis-output/feature-catalog.md`
- `analysis-output/feature-evidence.md`
- `analysis-output/coverage-report.md`
- `analysis-output/unresolved-items.md`

기존 소스 코드는 수정하지 않는다.
