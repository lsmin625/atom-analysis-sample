# feature-catalog-store (MCP server)

분석 산출물 중 `feature-catalog.json` 을 **로컬 PostgreSQL** 에 저장하는
Node.js 기반 MCP 서버다. 분석 작업이 완료되면 분석 에이전트가
`save_feature_catalog` 도구를 호출하여 결과를 적재한다.

## 무엇을 저장하나

도구 호출 시 다음 메타데이터가 함께 기록된다. 대부분 **소스코드에서
자동 추출**되며, 분석가 정보만 로컬 설정 파일에서 읽는다.

| 항목 | 출처(자동 추출) |
|---|---|
| 시스템(system) | `feature-catalog.json` 의 `systemName` |
| 애플리케이션(application) | 분석 대상의 `package.json`(node) 또는 `pom.xml`/`build.gradle`(java) |
| 저장소(repository) | 분석 대상 소스의 git `remote origin` / branch / commit |
| 분석 부분(scope) | 카탈로그 features 의 `sourceFiles` 로부터 도출한 경로 집합 |
| 분석 유형 | 출력 디렉터리명(`outputs/{frontend|backend|background}-analysis-output`) |
| 분석가(analyst) | 로컬 `analyst.config.json` (git 미동기화) |
| 분석 일시 | 카탈로그 `analysisDate` + 저장 시각(`saved_at`) |
| 버전(version) | 동일 (system, application, scope) 기준 1..n 자동 증가 |
| 저장물 | `feature-catalog.json` 전체(JSONB) + sha256 content hash |

## 사전 준비

1. 로컬 PostgreSQL 설치 및 DB 생성:
   ```bash
   createdb feature_catalog
   ```
2. 의존성 설치:
   ```bash
   cd mcp-servers/feature-catalog-store
   npm install
   ```
3. 워크스페이스 루트에 `analyst.config.json` 생성(아래 참조).
4. 스키마 초기화(선택 — 서버가 최초 저장 시 자동 생성도 함):
   ```bash
   npm run init-db
   ```

## 설정: `analyst.config.json`

워크스페이스 루트의 `analyst.config.example.json` 을 복사해서 만든다.
이 파일은 `.gitignore` 에 의해 **git 으로 동기화되지 않는다**.

```json
{
  "analyst": { "name": "홍길동", "email": "gildong.hong@example.com", "team": "OAS Platform" },
  "database": { "connectionString": "postgres://localhost:5432/feature_catalog" }
}
```

- `database.connectionString` 을 비우면 표준 `PG*` 환경변수
  (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`)를 사용한다.
- 설정 파일 위치는 `ANALYST_CONFIG_PATH` 환경변수로 지정할 수도 있다.
  지정하지 않으면 실행 CWD 에서 상위로 올라가며 `analyst.config.json` 을 찾는다.

## MCP 등록

워크스페이스 루트 `.mcp.json` 에 등록되어 있어 Claude Code 가 자동 인식한다.

```json
{ "mcpServers": { "feature-catalog-store": { "command": "node",
  "args": ["mcp-servers/feature-catalog-store/src/index.js"] } } }
```

## 도구: `save_feature_catalog`

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `catalogPath` | Y | 생성된 `feature-catalog.json` 경로 |
| `sourcePath` | N | 분석 대상 소스 루트(git repo). 기본값은 카탈로그의 `repositoryRoot` |
| `analysisType` | N | `frontend|backend|background`. 기본값은 출력 디렉터리명에서 추론 |
| `analyzedScope` | N | 분석한 부분 설명. 기본값은 sourceFiles 에서 도출 |

호출 예(에이전트가 분석 완료 후 실행):

```
save_feature_catalog(catalogPath="outputs/frontend-analysis-output/feature-catalog.json")
```

동일 대상을 재분석하면 `version` 이 자동 증가하며 이력이 누적된다.
버전 키는 `(system, application, analysis_type)` 이며 `analyzed_scope` 는 기록만 한다.

## 도구: `generate_decision_list`

분석 완료 후 `feature-catalog.json` 에서 **현업용 기능 결정 목록**
(`feature-decision-list.xlsx`)을 생성한다. 화면·코드 필드를 제거하고
업무 관점 컬럼 + 결정 컬럼(To-Be 채택/우선순위, 공란)으로 구성되어,
현업이 화면 없이 to-be 채택 여부를 논의할 수 있다.
frontend/backend/background 카탈로그 모두 지원한다.

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `catalogPath` | Y | 생성된 `feature-catalog.json` 경로 |
| `outPath` | N | 출력 xlsx 경로. 기본값은 카탈로그와 같은 폴더의 `feature-decision-list.xlsx` |

호출 예:

```
generate_decision_list(catalogPath="outputs/frontend-analysis-output/feature-catalog.json")
```

MCP 도구를 호출할 수 없는 환경에서는 동일 기능의 CLI 로 대체한다:

```bash
node src/gen-decision-list.js outputs/frontend-analysis-output/feature-catalog.json
# 또는: npm run gen-decision-list -- outputs/frontend-analysis-output/feature-catalog.json
```

DB 없이도 동작한다. 결정 목록 시트: `안내`, `기능결정목록`, `요약`.
