# Background Feature Catalog Schema

## Feature

각 기능은 다음 속성을 가진다.

| Field | Required | Description |
|---|---:|---|
| featureId | Y | 기능 고유 ID |
| systemName | Y | 시스템명 |
| domain | Y | 업무 영역 |
| module | Y | 모듈 또는 서비스 |
| featureGroup | Y | 작업 또는 기능 그룹 |
| featureName | Y | 업무 관점 기능명 |
| featureType | Y | 기능 유형 |
| description | Y | 기능 설명(한국어로 작성) |
| triggerType | Y | 트리거 유형 |
| triggerSpec | N | cron 식 / 주기 / 토픽 / 큐 / 이벤트 |
| entryPoint | Y | 기능 진입점 |
| jobOrListener | N | 대표 job/step 또는 listener |
| handlerMethod | N | 대표 처리 메서드 |
| preconditions | N | 실행 선행 조건 |
| inputs | N | 입력 소스(메시지/조회 대상/파일) |
| outputs | N | 처리 결과/적재 대상/발행 메시지 |
| businessRules | N | 코드로 확인된 업무 규칙 |
| concurrency | N | 동시성/단일 실행/락 정책 |
| idempotency | N | 멱등성/중복 방지 조건 |
| retryPolicy | N | 재시도/백오프/데드레터 |
| authorization | N | 실행 주체/권한 컨텍스트 |
| dataAccess | N | repository/query/체크포인트 |
| relatedEntities | N | 관련 도메인 엔터티 |
| externalCalls | N | 외부 시스템 연동 |
| processingType | Y | 처리 유형 |
| exceptionHandling | N | 오류 처리/알림 |
| monitoring | N | 메트릭/로깅/알림 |
| sourceFiles | Y | 근거 파일 |
| sourceSymbols | N | 근거 심볼 |
| confidence | Y | 분석 확실도 |
| analysisNote | N | 추정 및 확인 사항 |

## featureType enum

- SCHEDULED_SYNC
- AGGREGATION
- CLEANUP
- EXPIRY
- NOTIFY
- BATCH_LOAD
- ETL
- MESSAGE_CONSUME
- EVENT_HANDLE
- REPROCESS
- DEAD_LETTER
- REPORT_GENERATE
- FILE_TRANSFER
- HEALTH_CHECK
- MONITOR
- OTHER

## triggerType enum

- CRON
- FIXED_RATE
- FIXED_DELAY
- MESSAGE_QUEUE
- MESSAGE_TOPIC
- DOMAIN_EVENT
- STARTUP
- MANUAL_LAUNCH
- CONTINUOUS_LOOP

## entryPoint enum

- SCHEDULED_TASK
- BATCH_JOB
- BATCH_STEP
- MESSAGE_LISTENER
- EVENT_HANDLER
- WORKER_LOOP
- STARTUP_HOOK

복수 값이 필요한 경우 배열로 작성한다.

## processingType enum

- SYNC
- ASYNC
- SCHEDULED
- MESSAGE_DRIVEN
- BATCH_CHUNK
- STREAMING
- TRANSACTIONAL
- UNKNOWN

## Feature ID

다음 형식을 사용한다.

`FEAT-{DOMAIN_CODE}-{SEQUENCE}`

예:

`FEAT-SYNC-0001`
