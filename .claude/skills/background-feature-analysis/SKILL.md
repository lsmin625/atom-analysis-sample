---
name: background-feature-analysis
description: >
  Analyze a background/batch application and produce a complete, evidence-based
  feature catalog. Use this skill when asked to identify scheduled jobs, cron
  tasks, batch steps, message consumers, event listeners, workers, daemons,
  triggers, retry/idempotency/error handling, or feature coverage from Spring
  Batch/Scheduler, Kafka/RabbitMQ/SQS consumers, cron/worker scripts, or other
  non-interactive background source code.
---

# Background Feature Analysis

## Objective

백그라운드(비대화형) 애플리케이션을 분석하여 시스템이 자동으로
수행하는 처리 기능을 트리거 및 업무 처리 관점의 구조화된 기능
목록으로 작성한다.

사용자 요청 없이 실행되는 스케줄러, 배치, 메시지 컨슈머, 워커,
이벤트 핸들러가 주요 대상이다. 각 기능은 트리거(스케줄/메시지/이벤트)
→ 처리 로직 → 데이터 접근/외부 연동까지 경로 전체를 근거로 확인한다.

## Target application and scope

이 Skill은 사람이 직접 조작하지 않고 자동으로 동작하는 백그라운드
애플리케이션을 대상으로 한다.
대표 형태: Spring `@Scheduled`/Spring Batch, Quartz, Kafka/RabbitMQ/SQS
컨슈머, cron 스크립트, 워커/데몬 프로세스, 이벤트 리스너, ETL 파이프라인.

주요 분석 대상:

- 스케줄러/배치/컨슈머/워커 진입 클래스 및 스크립트
- job / step / reader / processor / writer, listener, handler
- 트리거 설정(cron 식, fixedRate, 큐/토픽 바인딩)
- `application.yml` / 환경 설정 / 배포·크론 설정 파일
- DB 스키마, 체크포인트/상태 저장소, `pom.xml`/`build.gradle`/`package.json`
- 테스트 코드

기본 제외 대상:

- `target/`, `build/`, `dist/`, `node_modules/`, `.git/`, IDE 설정
- 생성 코드, 컴파일 산출물, lock 파일

애플리케이션 종류가 프론트엔드 또는 대화형 백엔드 API이면 이 Skill 대신
`frontend-feature-analysis` 또는 `backend-feature-analysis`를 사용한다.
동일 저장소에 API와 백그라운드 처리가 함께 있으면 백그라운드 성격
기능만 이 Skill로 분석한다.

## Required references

분석을 시작하기 전에 다음 파일을 읽는다.

- `feature-schema.md`
- `validation-checklist.md`
- 저장소 루트의 `CLAUDE.md`

파일이 존재하지 않으면 현재 문서에 정의된 최소 규칙으로 진행하고
누락된 참조 문서를 unresolved 항목으로 기록한다.

## Analysis phases

반드시 다음 순서로 수행한다.

1. 기술 구조 및 실행/배포 방식 파악(스케줄러/배치/컨슈머 유형 식별)
2. 저장소 인벤토리 생성(트리거/처리/데이터 접근 분류)
3. 트리거 분석(cron 식, 주기, 큐/토픽, 이벤트 소스)
4. 작업 처리 흐름 분석(job → step, listener → handler → service)
5. 도메인/데이터 및 상태 저장소 분석(엔터티, 체크포인트, 오프셋)
6. 동시성·스케줄링 정책 분석(단일/멀티 인스턴스, 락, 중복 실행 방지)
7. 오류 처리·재시도·멱등성·데드레터 분석
8. 외부 연동 및 파일 입출력 분석
9. 기능 후보 통합(트리거+처리 단위를 하나의 업무 기능으로)
10. 근거 추적표 작성(트리거→처리→결과 경로 인용)
11. 누락 검증(독립 재조사)
12. 커버리지 계산 및 최종 산출물 생성

트리거 설정만 보고 실제 처리 로직 확인 없이 최종 목록을 작성하지 않는다.

## Feature identification sources

다음 근거를 모두 확인한다.

- scheduled trigger (cron, fixedRate, fixedDelay)
- batch job / step / chunk (reader, processor, writer)
- message consumer / listener (topic, queue, group)
- event handler / domain event subscriber
- worker / daemon loop
- startup / init task (실행 시 1회)
- processing logic (service, handler)
- data access / persistence (repository, query, checkpoint, offset)
- external integration (HTTP, message publish, storage)
- concurrency / locking / single-run guard
- retry / backoff / dead-letter
- idempotency / dedup 조건
- error handling / alerting
- file import / export (batch I/O)
- configuration property (스케줄, 크기, 임계치)
- monitoring / metrics / logging
- test scenario

## Background-specific patterns

프레임워크에 맞게 다음 패턴을 검색한다.

- Spring 스케줄: `@Scheduled` `@EnableScheduling` `cron =` `fixedRate`
  `fixedDelay` `TaskScheduler` `Trigger`
- Spring Batch: `@EnableBatchProcessing` `Job` `Step` `ItemReader`
  `ItemProcessor` `ItemWriter` `JobLauncher` `StepBuilder` `chunk(`
  `JobRepository` `@JobScope` `@StepScope`
- Quartz: `QuartzJobBean` `JobDetail` `Trigger` `CronScheduleBuilder`
- 메시징: `@KafkaListener` `@RabbitListener` `@JmsListener`
  `@SqsListener` `MessageListener` `@StreamListener` `consumer.poll`
  `ack` `nack` `@EventListener` `ApplicationListener`
- 워커/데몬: `while(true)` 루프, `ExecutorService` `ScheduledExecutorService`
  `Thread` `CompletableFuture`, cron 스크립트(`crontab`, `*.sh`)
- 신뢰성: `@Retryable` `RetryTemplate` `backoff` `DeadLetter`
  `ShedLock` `@SchedulerLock` `idempotent` 체크, 오프셋/체크포인트 커밋

## Feature granularity

트리거와 처리 목적이 다르면 별도 기능으로 분리한다.

- 주기적 데이터 동기화 / 집계
- 정리(cleanup)·만료 처리
- 알림·리마인더 발송
- 배치 적재(ETL) / 대량 처리
- 메시지 소비 후 처리(토픽/큐 단위)
- 이벤트 기반 후속 처리
- 재처리 / 데드레터 처리
- 리포트·파일 생성 및 전송

동일 업무가 여러 트리거·스텝·리스너에 걸쳐 나타나면 하나로 통합하고
근거를 여러 개 연결한다.

## Evidence requirement

각 기능에는 최소 하나 이상의 근거를 기록한다.

가능하면 다음 근거 조합을 확보한다.

- 트리거 근거(스케줄/리스너/이벤트 소스)
- 처리 로직 근거(job/step/handler/service)
- 데이터 접근 또는 외부 연동 근거

각 근거에 다음을 기록한다.

- evidenceType
- filePath
- symbol
- lineRange
- description

## Confidence

- `HIGH`: 트리거 → 처리 로직 → 데이터 접근/연동 경로가 모두 확인됨
- `MEDIUM`: 트리거 또는 처리 로직 중 일부 근거만 확인됨
- `LOW`: 구조와 명칭을 통한 추정이며 실행 근거가 부족함

## Coverage gate

최종 완료 전에 다음을 계산한다.

- trigger coverage (스케줄/리스너/이벤트)
- job/step coverage
- handler/processor coverage
- data access coverage
- retry/idempotency condition coverage
- error/dead-letter handling coverage
- test-scenario coverage

비활성(disabled)·미등록·호출되지 않는 트리거/작업은 명시적으로 구분한다.
커버리지가 100%가 아니면 미분류 항목을 전부 `unresolved-items.md`에 기록한다.

## Output

**산출물 언어**: 모든 서술형 텍스트(기능 설명, 요약, 근거 서술,
커버리지·미해결 항목 설명, 결정 목록 업무 서술)는 **한국어로 작성한다.**
대상 소스가 영어여도 분석 설명은 한국어로 쓴다. 단, 식별자·심볼(파일
경로, 클래스·메서드·변수명, 잡·트리거명, 큐·토픽명, DB 컬럼), 열거형 값
(`HIGH`/`LOW`), 스키마 키 이름과 `FEAT-...` ID 형식은 원문을 유지한다.

출력 디렉터리는 **분석 대상 저장소명과 동일한** `outputs/<저장소명>/`
이다. `<저장소명>` 은 분석 대상의 최상위 디렉터리명으로, 기본 위치
기준 `inputs/` 바로 아래 디렉터리명을 사용한다(예: `inputs/oas-batch`
→ `outputs/oas-batch/`). 이 디렉터리에 다음 6개 파일을 생성한다.

- `outputs/<저장소명>/repository-inventory.md`
- `outputs/<저장소명>/feature-catalog.json`
- `outputs/<저장소명>/feature-catalog.md`
- `outputs/<저장소명>/feature-evidence.md`
- `outputs/<저장소명>/coverage-report.md`
- `outputs/<저장소명>/unresolved-items.md`

기존 소스 코드는 수정하지 않는다.

## Result persistence and decision list

6개 산출물 생성 후 다음 두 후처리를 수행한다(모두 `feature-catalog-store` MCP 서버).

1. **DB 저장** — `save_feature_catalog` (catalogPath=`outputs/<저장소명>/feature-catalog.json`)
   → `feature-catalog.json` 을 로컬 PostgreSQL 에 저장. 시스템·애플리케이션·
   저장소·분석가·분석 일시·버전은 자동 기록된다.
2. **기능 결정 목록 생성** — `generate_decision_list` (catalogPath 동일)
   → 같은 디렉터리에 `feature-decision-list.xlsx` 를 생성한다(현업이 화면 없이
   to-be 채택 여부를 논의하는 업무 관점 목록).
   - CLI 대체: `node mcp-servers/feature-catalog-store/src/gen-decision-list.js outputs/<저장소명>/feature-catalog.json`

- 후처리가 실패해도 6개 산출물은 유효하며 실패 사유만 보고한다.
  결정 목록 생성은 DB 없이도 동작한다.
