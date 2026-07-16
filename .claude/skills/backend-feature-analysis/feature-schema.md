# Backend Feature Catalog Schema

## Feature

각 기능은 다음 속성을 가진다.

| Field | Required | Description |
|---|---:|---|
| featureId | Y | 기능 고유 ID |
| systemName | Y | 시스템명 |
| domain | Y | 업무 영역 |
| module | Y | 모듈 또는 서비스 |
| featureGroup | Y | 리소스 또는 기능 그룹 |
| featureName | Y | 업무 관점 기능명 |
| featureType | Y | 기능 유형 |
| description | Y | 기능 설명 |
| endpoint | N | API 경로(URI 템플릿) |
| httpMethod | N | HTTP 메서드 |
| entryPoint | Y | 기능 진입점 |
| controller | N | 대표 컨트롤러/핸들러 |
| serviceMethod | N | 대표 서비스 메서드 |
| trigger | N | 호출 트리거(요청/이벤트/스케줄) |
| preconditions | N | 실행 선행 조건 |
| requestInputs | N | 요청 입력(path/query/body/header) |
| responseOutputs | N | 응답 또는 처리 결과 |
| businessRules | N | 코드로 확인된 업무 규칙 |
| validationRules | N | 입력 검증 |
| authentication | N | 인증 방식(세션/JWT 등) |
| authorization | N | 권한 및 역할 |
| apiEndpoints | N | 관련 엔드포인트 |
| dataAccess | N | repository/query/table |
| relatedEntities | N | 관련 도메인 엔터티 |
| transaction | N | 트랜잭션 경계/전파 |
| externalCalls | N | 외부 시스템 연동 |
| processingType | Y | 처리 유형 |
| exceptionHandling | N | 오류 처리/응답 코드 |
| sourceFiles | Y | 근거 파일 |
| sourceSymbols | N | 근거 심볼 |
| confidence | Y | 분석 확실도 |
| analysisNote | N | 추정 및 확인 사항 |

## featureType enum

- QUERY_LIST
- QUERY_SEARCH
- QUERY_DETAIL
- CREATE
- UPDATE
- DELETE
- STATE_CHANGE
- APPROVE
- REJECT
- COMMAND
- AUTHENTICATE
- AUTHORIZE
- IMPORT
- UPLOAD
- EXPORT
- DOWNLOAD
- INTEGRATION
- NOTIFY
- SCHEDULE
- CACHE
- AUDIT
- CONFIGURE
- OTHER

## entryPoint enum

- REST_ENDPOINT
- GRAPHQL_RESOLVER
- RPC_METHOD
- MESSAGE_LISTENER
- SCHEDULED_TASK
- EVENT_HANDLER
- FILTER_INTERCEPTOR
- INTERNAL_SERVICE

복수 값이 필요한 경우 배열로 작성한다.

## processingType enum

- SYNC
- ASYNC
- TRANSACTIONAL
- STREAMING
- SCHEDULED
- MESSAGE_DRIVEN
- UNKNOWN

## Feature ID

다음 형식을 사용한다.

`FEAT-{DOMAIN_CODE}-{SEQUENCE}`

예:

`FEAT-ACC-0001`
