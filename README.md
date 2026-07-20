# atom-analysis-sample

## 개요

이 저장소는 **Claude Code 기반 애플리케이션 기능 분석 워크스페이스**다.

`inputs/` 하위에 놓인 분석 대상 애플리케이션을 읽어, 소스 코드로부터
**사용자·업무 관점의 근거 기반 기능 목록(feature catalog)** 을 자동으로
도출하는 것을 목적으로 한다. 분석 대상은 프론트엔드, 백엔드,
백그라운드(배치·스케줄러·워커) 등 종류에 제한이 없다.

워크스페이스 자체는 특정 애플리케이션이 아니라, 분석을 수행하는
**규칙(CLAUDE.md) · 분석 스킬 · 전용 서브에이전트 · 산출물 규약**의
집합이다. 분석 대상 원본 소스는 절대 수정하지 않으며, 산출물은
저장소 루트의 전용 출력 디렉터리에 생성한다.

## 특징

- **애플리케이션 종류 무관**: 프론트/백엔드/백그라운드 각각에 특화된
  분석 스킬과 서브에이전트를 제공하며, 요청 시 대상 종류를 식별해
  적합한 분석기를 사용한다.
- **근거 기반(evidence-based)**: 모든 기능에 파일 경로와 코드 심볼
  근거를 기록한다. 파일명·클래스명만 보고 기능을 확정하지 않는다.
- **확실도 표기**: 각 기능에 `HIGH / MEDIUM / LOW` confidence를 부여하고,
  추정은 반드시 LOW로 구분한다.
- **독립 누락 검증**: 초기 기능 목록 생성 후, 이를 신뢰하지 않고
  독립적으로 재조사하여 누락·과대주장·잘못된 근거를 점검한다.
- **원본 불변**: 분석 대상 소스는 변경하지 않는다. 산출물만 생성한다.
- **표준 산출물 규약**: 종류와 무관하게 동일한 6종 산출물과
  커버리지 게이트 기준을 공유한다.

## 디렉터리 구조

```
atom-analysis-sample/
├─ CLAUDE.md                     # 워크스페이스 공통 지침(종류 무관, 규칙·위임·출력 규약)
├─ README.md                     # 본 문서
├─ .claude/
│  ├─ skills/                    # 애플리케이션 종류별 분석 스킬
│  │  ├─ frontend-feature-analysis/    # SKILL.md + feature-schema.md + validation-checklist.md
│  │  ├─ backend-feature-analysis/
│  │  └─ background-feature-analysis/
│  ├─ agents/                    # 종류별 전용 서브에이전트
│  │  ├─ frontend-feature-analyst/
│  │  ├─ backend-feature-analyst/
│  │  └─ background-feature-analyst/
│  └─ agent-memory/              # 에이전트의 프로젝트 분석 메모리(재분석 가속)
├─ prompts/                      # 분석·검증에 사용하는 프롬프트 템플릿
├─ mcp-servers/                  # 워크스페이스 MCP 서버(Node.js)
│  └─ feature-catalog-store/     # feature-catalog.json → 로컬 PostgreSQL 저장
├─ .mcp.json                     # MCP 서버 등록(Claude Code 자동 인식)
├─ analyst.config.example.json   # 분석가 설정 템플릿(커밋됨)
├─ analyst.config.json           # 분석가 실제 설정(로컬 전용, git 미추적)
├─ inputs/                       # 분석 대상 애플리케이션(git 미추적)
│  ├─ oas-doc-ui/                # 프론트엔드 샘플: Vue 3 + TypeScript + Vite + Bootstrap
│  └─ oas-doc-api/               # 백엔드 샘플: Spring Boot + JPA + JWT (Maven)
└─ outputs/                      # 분석 산출물(git 미추적)
   ├─ oas-doc-ui/                 # inputs/oas-doc-ui 분석 결과(저장소명과 동일)
   └─ oas-doc-api/                # inputs/oas-doc-api 분석 결과(저장소명과 동일)
```

> `inputs/`, `outputs/`, `analyst.config.json`, `mcp-servers/**/node_modules/`
> 는 `.gitignore`에 의해 커밋에서 제외된다. 분석 대상 소스, 생성 결과물,
> 분석가 개인 설정은 로컬 워크스페이스에만 존재한다.

## 분석기 구성

| 종류 | 분석 Skill | 전용 서브에이전트 |
|---|---|---|
| 프론트엔드 | `frontend-feature-analysis` | `frontend-feature-analyst` |
| 백엔드 | `backend-feature-analysis` | `backend-feature-analyst` |
| 백그라운드 | `background-feature-analysis` | `background-feature-analyst` |

출력 디렉터리는 종류와 무관하게 **분석 대상 저장소명과 동일한**
`outputs/<저장소명>/` 이다. `<저장소명>` 은 분석 대상의 최상위
디렉터리명으로, 기본 위치 기준 `inputs/` 바로 아래 디렉터리명을
사용한다(예: `inputs/oas-doc-ui` → `outputs/oas-doc-ui/`,
`inputs/oas-doc-api` → `outputs/oas-doc-api/`).

각 Skill은 애플리케이션 종류에 맞춘 12단계 분석 절차, 기능 스키마
(`feature-schema.md`), 검증 체크리스트(`validation-checklist.md`)를 포함한다.
세 종류 모두 동일한 근거 요건·confidence 기준·커버리지 게이트를 공유한다.

## 표준 산출물

각 분석은 해당 출력 디렉터리에 다음 6개 파일을 생성한다.

- `repository-inventory.md` — 저장소 인벤토리(구성요소 분류)
- `feature-catalog.json` — 기계 판독용 기능 카탈로그
- `feature-catalog.md` — 사람 판독용 기능 카탈로그
- `feature-evidence.md` — 기능별 파일·심볼 근거 추적표
- `coverage-report.md` — 커버리지 지표 및 최종 분류
- `unresolved-items.md` — 미분류·의심·확인 필요 항목

## 분석 완료 후처리 (자동)

분석이 완료되면 `mcp-servers/feature-catalog-store` MCP 서버가 두 가지
후처리를 자동 수행한다(MCP 도구 미노출 환경에서는 CLI 로 대체).

**1. DB 저장** — `save_feature_catalog` 로 `feature-catalog.json` 을 로컬
PostgreSQL 에 저장. 함께 기록되는 메타데이터:

- **시스템 / 애플리케이션 / 저장소 / 분석 부분** — 소스코드와 카탈로그에서
  자동 추출(package.json·pom.xml, git remote/branch/commit, `systemName`·`sourceFiles`)
- **분석가** — 로컬 `analyst.config.json` 에서 읽음
- **분석 일시 / 저장물 버전** — 자동 기록(동일 대상 재분석 시 버전 1씩 증가;
  버전 키는 시스템·애플리케이션·분석유형)

**2. 기능 결정 목록 생성** — `generate_decision_list` 로 해당 출력 폴더에
`feature-decision-list.xlsx` 를 생성. 화면·코드 용어를 제거하고 업무 관점
컬럼 + 결정 컬럼(To-Be 채택/우선순위)으로 구성되어, 현업이 화면 없이
to-be 채택 여부를 논의할 수 있다. DB 없이도 동작한다.
CLI: `node mcp-servers/feature-catalog-store/src/gen-decision-list.js <catalogPath>`

서버 구성·스키마·도구 파라미터의 자세한 내용은
`mcp-servers/feature-catalog-store/README.md` 를 참고한다.

## 분석가 정보 설정 (git 미동기화)

분석가는 워크스페이스를 clone 한 뒤, 자신의 정보를 **로컬 파일에만**
설정한다. 이 파일은 `.gitignore` 에 등록되어 있어 git 으로 동기화되지
않으며, 각자의 신원과 로컬 DB 접속 정보를 담는다.

1. 템플릿을 복사한다.
   ```bash
   cp analyst.config.example.json analyst.config.json
   ```
2. `analyst.config.json` 을 자신의 정보로 수정한다.
   ```json
   {
     "analyst": { "name": "홍길동", "email": "gildong.hong@example.com", "team": "OAS Platform" },
     "database": { "connectionString": "postgres://localhost:5432/feature_catalog" }
   }
   ```
   - `database.connectionString` 을 비우면 표준 `PG*` 환경변수를 사용한다.
   - 파일 위치는 `ANALYST_CONFIG_PATH` 환경변수로 지정할 수도 있다.

> `analyst.config.json` 은 커밋 대상이 아니다. 커밋되는 것은 템플릿인
> `analyst.config.example.json` 뿐이다. 분석가 정보는 각 로컬에만 존재한다.

## 사용 방법

1. (최초 1회) 로컬 PostgreSQL 준비 및 MCP 서버 의존성 설치.
   ```bash
   createdb feature_catalog
   cd mcp-servers/feature-catalog-store && npm install
   ```
2. `analyst.config.json` 을 설정한다(위 "분석가 정보 설정" 참조).
3. 분석 대상 애플리케이션을 `inputs/` 하위에 배치한다.
4. Claude Code에서 분석을 요청한다. 대상 종류에 맞는 Skill 또는
   전용 서브에이전트가 선택된다. `prompts/`의 템플릿을 참고할 수 있다.
5. 분석 완료 후 해당 `outputs/` 디렉터리에서 산출물을 확인하고,
   결과는 자동으로 PostgreSQL 에 저장된다.

## 원칙

- 애플리케이션 원본 소스를 명시적 요청 없이 수정하지 않는다.
- 파일을 직접 확인하지 않은 내용을 사실로 단정하지 않는다.
- 백엔드 업무 규칙을 임의로 지어내지 않는다. 코드로 확인된 것만 기록한다.
- 주석 처리되거나 미사용(dead)으로 판단되는 코드는 운영 기능과 구분한다.

자세한 공통 규칙은 `CLAUDE.md`, 종류별 세부 절차는 각 Skill 문서를 참고한다.
