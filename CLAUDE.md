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

각 분석 Skill은 애플리케이션 종류에 따라 다음 규칙의 전용
출력 디렉터리에 산출물을 작성한다.

- 프론트엔드: `frontend-analysis-output/`
- 백엔드: `backend-analysis-output/`
- 백그라운드: `background-analysis-output/`

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

## Result persistence

분석 작업이 완료되어 6개 표준 산출물을 생성한 뒤에는,
`feature-catalog-store` MCP 서버의 `save_feature_catalog` 도구를 호출하여
`feature-catalog.json` 을 로컬 PostgreSQL 에 저장한다.

- 최소 인자: `catalogPath`(생성된 `feature-catalog.json` 경로).
- 시스템·애플리케이션·저장소·분석 부분 정보는 소스코드와 카탈로그에서
  자동 추출되고, 분석가 정보는 로컬 `analyst.config.json` 에서 읽으며,
  분석 일시와 저장물 버전은 도구가 자동 기록한다.
- 사전 준비(로컬 DB, `analyst.config.json` 설정)는 README.md 와
  `mcp-servers/feature-catalog-store/README.md` 를 따른다.
- 도구 호출이 실패하면(예: DB 미가동, 분석가 미설정) 산출물 생성은
  유효하므로 실패 사유만 사용자에게 보고하고 산출물은 유지한다.
