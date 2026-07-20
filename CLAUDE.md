# Project Instructions

## Project

이 저장소는 애플리케이션 **기능 분석 워크스페이스**다.

분석 대상 애플리케이션은 `inputs/` 하위에 위치하며, 종류는
프론트엔드, 백엔드, 백그라운드(배치·스케줄러·워커·컨슈머) 등으로
다양하다. 저장소 자체는 특정 기술 스택에 종속되지 않는다.

분석 산출물은 저장소 루트에 생성하며, 대상 애플리케이션의 원본
소스는 변경하지 않는다.

## Repository scope

분석 대상은 요청 시점에 지정된 애플리케이션이며, 기본 위치는
`inputs/` 하위 디렉터리다. 요청에 명시된 경로가 있으면 그 경로를
우선한다.

기본 제외 대상(모든 애플리케이션 종류 공통):

- `node_modules/`, `dist/`, `build/`, `target/`, `coverage/`
- `.git/`, IDE 설정(`.vscode/`, `.settings/`, `.factorypath`)
- lock 파일(`package-lock.json`, `pom.xml`의 의존성 트리 등 생성물)
- 생성 코드, 번들, 컴파일 산출물(`*.class`, `*.jar` 등)

세부 분석 대상 및 제외 규칙은 각 분석 Skill이 애플리케이션 종류에
맞게 정의한다.

## General rules

애플리케이션 종류와 무관하게 항상 준수한다.

- 기존 애플리케이션 소스를 명시적 요청 없이 수정하지 않는다.
- 파일을 직접 확인하지 않은 내용을 사실로 단정하지 않는다.
- 추정한 내용은 `confidence: LOW`와 함께 기록한다.
- 파일명·클래스명·심볼명만 보고 기능을 확정하지 않는다.
- 진입점, 처리 로직, 데이터 접근/외부 연동, 권한 근거를 교차 확인한다.
- 분석 결과에는 항상 파일 경로와 코드 심볼을 포함한다.
- 주석 처리되거나 미사용(dead)으로 판단되는 코드는 운영 기능과 구분한다.
- 백엔드 업무 규칙을 임의로 지어내지 않는다. 코드로 확인된 것만 기록한다.
- 초기 기능 목록 생성 후 독립적으로 누락 검증을 수행한다.

## Feature analysis

기능 분석 요청을 받으면 **먼저 대상 애플리케이션 종류를 식별**하고
적합한 Skill을 사용한다.

| 애플리케이션 종류 | 판단 근거 예시 | 사용 Skill |
|---|---|---|
| 프론트엔드 | Vue/React/Angular, 라우터, 컴포넌트, 브라우저 UI | `frontend-feature-analysis` |
| 백엔드 | REST/GraphQL 컨트롤러, 서비스, 리포지토리, DB 엔터티 | `backend-feature-analysis` |
| 백그라운드 | 스케줄러, 배치, 메시지 컨슈머, 워커, 데몬 | `background-feature-analysis` |

종류가 불분명하거나 한 저장소에 여러 종류가 섞여 있으면, 종류별로
해당 Skill을 각각 적용하고 산출물을 분리한다.

대규모 전체 분석은 가능한 경우 분석 서브에이전트에 위임한다.
프론트엔드 분석에는 `frontend-feature-analyst` 서브에이전트가
준비되어 있으며, 백엔드·백그라운드 분석은 `general-purpose`
서브에이전트에 해당 Skill을 지시하여 위임할 수 있다.

## Output location

각 분석 Skill은 **분석 대상 저장소명과 동일한 이름의 전용 출력
디렉터리**에 산출물을 작성한다. 출력 디렉터리 규칙은 다음과 같다.

    outputs/<분석 대상 저장소명>/

- `<분석 대상 저장소명>` 은 분석 대상의 최상위 디렉터리명이다. 기본
  위치 기준으로 `inputs/` 바로 아래 디렉터리명을 사용한다.
  예: `inputs/oas-doc-ui` → `outputs/oas-doc-ui/`,
  `inputs/oas-doc-api` → `outputs/oas-doc-api/`.
- 요청에 명시된 경로가 있으면 그 경로의 최상위(리프) 디렉터리명을 쓴다.
- 애플리케이션 종류(프론트/백엔드/백그라운드)는 출력 디렉터리명에
  반영하지 않는다. 종류와 무관하게 저장소명만 사용한다.
- 한 저장소에 여러 종류가 섞여 종류별로 산출물을 분리해야 하면,
  저장소 디렉터리 아래 종류별 하위 디렉터리로 나눈다.
  예: `outputs/<저장소명>/frontend/`, `outputs/<저장소명>/backend/`.

모든 종류가 공통으로 다음 6개 표준 산출물을 생성한다.

- `repository-inventory.md`
- `feature-catalog.json`
- `feature-catalog.md`
- `feature-evidence.md`
- `coverage-report.md`
- `unresolved-items.md`

산출물의 구체적 스키마·커버리지 기준·산출 절차는 각 Skill과
그에 딸린 `feature-schema.md`, `validation-checklist.md`에 정의한다.

분석을 위해 애플리케이션 원본 파일을 변경하지 않는다.

## Result persistence and decision list

분석 작업이 완료되어 6개 표준 산출물을 생성한 뒤에는, 다음 **두 가지
후처리를 반드시 수행**한다. 두 작업 모두 `feature-catalog-store` MCP
서버가 담당하며, MCP 도구를 호출할 수 없는 실행 환경(예: 서브에이전트
툴셋 미노출)에서는 동일 기능의 CLI 로 대체 실행한다.

1. **DB 저장** — `save_feature_catalog`(catalogPath=생성된 `feature-catalog.json`)
   로 `feature-catalog.json` 을 로컬 PostgreSQL 에 저장한다. 시스템·애플리케이션·
   저장소·분석 부분은 소스/카탈로그에서 자동 추출, 분석가는 로컬
   `analyst.config.json` 에서 읽고, 분석 일시·저장물 버전은 자동 기록된다.
   - CLI 대체: 없음(DB 저장은 MCP 서버를 stdio 로 구동해 수행).

2. **기능 결정 목록 생성** — `generate_decision_list`(catalogPath 동일)로
   `feature-decision-list.xlsx` 를 해당 출력 디렉터리에 생성한다. 현업이
   화면 없이 to-be 채택 여부를 논의할 수 있는 업무 관점 목록이다.
   - CLI 대체: `node mcp-servers/feature-catalog-store/src/gen-decision-list.js <catalogPath>`

- 사전 준비(로컬 DB, `analyst.config.json`, `npm install`)는 README.md 와
  `mcp-servers/feature-catalog-store/README.md` 를 따른다.
- 어느 후처리가 실패해도(예: DB 미가동, 분석가 미설정) 6개 산출물은
  유효하므로 실패 사유만 보고하고 산출물은 유지한다. 결정 목록 생성은
  DB 없이도 동작한다.
