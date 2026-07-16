---
name: backend-feature-analysis
description: >
  Analyze a backend/server application and produce a complete, evidence-based
  feature catalog. Use this skill when asked to identify API endpoints, request
  handlers, services, business logic, data access, transactions, authentication,
  authorization, validation, error handling, file import/export, integrations,
  or feature coverage from Spring, Node/Express/NestJS, Django, or other backend
  source code.
---

# Backend Feature Analysis

## Objective

백엔드(서버) 애플리케이션을 분석하여 시스템이 제공하는 기능을
API 및 업무 처리 관점의 구조화된 기능 목록으로 작성한다.

단순 클래스 목록이나 엔드포인트 나열을 작성하지 않는다.
각 기능은 진입점(엔드포인트/리스너) → 업무 로직 → 데이터 접근/외부 연동까지
호출 경로 전체를 근거로 확인한다.

## Target application and scope

이 Skill은 서버에서 요청을 처리하는 백엔드 애플리케이션을 대상으로 한다.
대표 스택: Spring Boot(Java/Kotlin), Node.js(Express/NestJS), Django/FastAPI,
Go 등. (참조 저장소 `inputs/oas-doc-api`는 Spring Boot + JPA + JWT 기반이다.)

주요 분석 대상:

- `src/main/java/**` 또는 `src/**` 애플리케이션 소스
- controller / router / handler, service, repository / DAO, entity / model
- `application.yml` / `application.properties` / 환경 설정
- DB 스키마(`*.sql`, migration), `pom.xml` / `build.gradle` / `package.json`
- `src/test/**` 테스트 코드

기본 제외 대상:

- `target/`, `build/`, `dist/`, `node_modules/`, `.git/`, IDE 설정
- 생성 코드, 컴파일 산출물(`*.class`, `*.jar`), lock 파일

애플리케이션 종류가 프론트엔드 또는 백그라운드이면 이 Skill 대신
`frontend-feature-analysis` 또는 `background-feature-analysis`를 사용한다.

## Required references

분석을 시작하기 전에 다음 파일을 읽는다.

- `feature-schema.md`
- `validation-checklist.md`
- 저장소 루트의 `CLAUDE.md`

파일이 존재하지 않으면 현재 문서에 정의된 최소 규칙으로 진행하고
누락된 참조 문서를 unresolved 항목으로 기록한다.

## Analysis phases

반드시 다음 순서로 수행한다.

1. 기술 구조 및 빌드/실행 설정 파악
2. 저장소 인벤토리 생성(레이어별 파일 분류)
3. 엔드포인트 및 라우팅 분석(경로, HTTP 메서드, 매핑)
4. 요청 처리 흐름 분석(controller → service → repository)
5. 도메인/데이터 모델 및 영속성 분석(엔터티, 스키마, 트랜잭션)
6. 인증·인가 분석(세션/토큰, 역할, 접근 제어)
7. 입력 검증 및 예외/오류 처리 분석
8. 외부 연동 및 파일 입출력 분석(HTTP 클라이언트, 메시지, Excel/CSV)
9. 기능 후보 통합(엔드포인트/서비스/스케줄을 하나의 업무 기능으로)
10. 근거 추적표 작성(호출 경로 인용)
11. 누락 검증(독립 재조사)
12. 커버리지 계산 및 최종 산출물 생성

단일 레이어(예: 컨트롤러만) 탐색 결과로 최종 목록을 작성하지 않는다.

## Feature identification sources

다음 근거를 모두 확인한다.

- endpoint / route mapping
- HTTP method and path
- request DTO / query / path variable / header
- response DTO / status code
- service method (business logic)
- repository / DAO / query (SQL, JPA, ORM)
- domain entity / table
- transaction boundary
- authentication (session, JWT, OAuth)
- authorization (role, scope, method security, guard)
- input validation rule
- exception / error mapping
- external integration (HTTP client, gRPC, message publish)
- scheduled / async task 호출(백그라운드 성격이면 background skill로 이관)
- file import / export (Excel, CSV, PDF)
- caching / rate limiting
- audit / logging (AOP, interceptor, filter)
- configuration property
- test scenario

## Backend-specific patterns

프레임워크에 맞게 다음 패턴을 검색한다.

- Spring: `@RestController` `@Controller` `@RequestMapping` `@GetMapping`
  `@PostMapping` `@PutMapping` `@DeleteMapping` `@PatchMapping`
  `@Service` `@Repository` `@Transactional` `@Query` `@Entity`
  `@Valid` `@Validated` `@PreAuthorize` `@Secured` `@RolesAllowed`
  `@ExceptionHandler` `@ControllerAdvice` `@Aspect` `@Around`
  `@ConfigurationProperties` `@Scheduled` `@Async`
- Node/Nest: `app.get/post/put/delete` `router.*` `@Controller` `@Get`
  `@Post` `@Injectable` `@Guard` `@UseGuards` `middleware` `next()`
- 데이터 접근: `JpaRepository` `EntityManager` `createQuery`
  `@Query` raw SQL, ORM 모델(`prisma` `sequelize` `mybatis` mapper)
- 인증/인가: `JwtTool` `SecurityFilterChain` `Authentication`
  `SessionHandler` `verifyToken` `hasRole` `getPrincipal`
- 입출력/연동: `RestTemplate` `WebClient` `HttpClient` `fetch`
  `FeignClient` `KafkaTemplate.send` `MultipartFile` `ExcelTool`
  `InputStreamResource` `ResponseEntity`

## Feature granularity

사용자/시스템 관점의 목적과 결과가 다르면 별도 기능으로 분리한다.

- 목록 조회 / 페이징 조회
- 조건 검색
- 단건 상세 조회
- 등록(생성)
- 수정
- 삭제
- 상태 변경 / 승인 / 반려
- 인증(로그인/토큰 발급/갱신)
- 인가(접근 제어)
- 파일 업로드 / 다운로드 / 내보내기
- 외부 시스템 연동 호출

동일 업무 기능이 여러 엔드포인트·서비스·쿼리에 걸쳐 나타나면
하나로 통합하고 호출 경로 근거를 여러 개 연결한다.

## Evidence requirement

각 기능에는 최소 하나 이상의 근거를 기록한다.

가능하면 다음 근거 조합을 확보한다.

- 진입점 근거(엔드포인트/매핑)
- 업무 로직 근거(service 메서드)
- 데이터 접근 또는 외부 연동 근거(repository/query/client)

각 근거에 다음을 기록한다.

- evidenceType
- filePath
- symbol
- lineRange
- description

## Confidence

- `HIGH`: 엔드포인트 → 서비스 → 데이터 접근/연동 경로가 모두 확인됨
- `MEDIUM`: 진입점 또는 처리 로직 중 일부 근거만 확인됨
- `LOW`: 구조와 명칭을 통한 추정이며 실행 근거가 부족함

## Coverage gate

최종 완료 전에 다음을 계산한다.

- endpoint coverage
- controller/handler coverage
- service method coverage
- repository/query coverage
- entity/table coverage
- authentication/authorization condition coverage
- validation rule coverage
- test-scenario coverage

호출되지 않는(dead) 엔드포인트·서비스·쿼리는 명시적으로 구분해 기록한다.
커버리지가 100%가 아니면 미분류 항목을 전부 `unresolved-items.md`에 기록한다.

## Output

출력 디렉터리는 `backend-analysis-output/` 이며 다음 6개 파일을 생성한다.

- `backend-analysis-output/repository-inventory.md`
- `backend-analysis-output/feature-catalog.json`
- `backend-analysis-output/feature-catalog.md`
- `backend-analysis-output/feature-evidence.md`
- `backend-analysis-output/coverage-report.md`
- `backend-analysis-output/unresolved-items.md`

기존 소스 코드는 수정하지 않는다.

## Result persistence

6개 산출물 생성 후, `feature-catalog-store` MCP 서버의
`save_feature_catalog` 도구를 호출하여 `feature-catalog.json` 을
로컬 PostgreSQL 에 저장한다.

- `catalogPath="backend-analysis-output/feature-catalog.json"`
- 시스템·애플리케이션·저장소·분석가·분석 일시·버전은 자동 기록된다.
- 도구 호출이 실패해도 산출물은 유효하며 실패 사유만 보고한다.
