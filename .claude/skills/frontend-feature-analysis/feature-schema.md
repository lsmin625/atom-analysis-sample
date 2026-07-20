# Feature Catalog Schema

## Feature

각 기능은 다음 속성을 가진다.

| Field | Required | Description |
|---|---:|---|
| featureId | Y | 기능 고유 ID |
| systemName | Y | 시스템명 |
| domain | Y | 업무 영역 |
| module | Y | 모듈 또는 대메뉴 |
| featureGroup | Y | 화면 또는 기능 그룹 |
| featureName | Y | 사용자 관점 기능명 |
| featureType | Y | 기능 유형 |
| description | Y | 기능 설명(한국어로 작성) |
| route | N | 접근 URL |
| screenName | N | 화면명 |
| entryPoint | Y | 기능 진입점 |
| component | N | 대표 컴포넌트 |
| trigger | N | 사용자 또는 시스템 트리거 |
| preconditions | N | 실행 선행 조건 |
| inputs | N | 입력 데이터 |
| outputs | N | 출력 또는 처리 결과 |
| businessRules | N | 확인된 업무 규칙 |
| validationRules | N | 입력 검증 |
| permission | N | 권한 및 역할 |
| apiEndpoints | N | 관련 API |
| httpMethods | N | HTTP 메서드 |
| stateStores | N | 관련 상태 저장소 |
| relatedEntities | N | 관련 업무 엔터티 |
| processingType | Y | 처리 유형 |
| exceptionHandling | N | 오류 처리 |
| sourceFiles | Y | 근거 파일 |
| sourceSymbols | N | 근거 심볼 |
| confidence | Y | 분석 확실도 |
| analysisNote | N | 추정 및 확인 사항 |

## featureType enum

- NAVIGATION
- LIST
- SEARCH
- VIEW
- CREATE
- UPDATE
- DELETE
- APPROVE
- REJECT
- EXECUTE
- IMPORT
- UPLOAD
- EXPORT
- DOWNLOAD
- PRINT
- AUTHENTICATE
- AUTHORIZE
- CONFIGURE
- NOTIFY
- MONITOR
- BACKGROUND
- OTHER

## entryPoint enum

- MENU
- ROUTE
- BUTTON
- LINK
- TAB
- ROW_ACTION
- FORM_SUBMIT
- MODAL
- PAGE_LOAD
- FIELD_CHANGE
- KEYBOARD
- TIMER
- EXTERNAL_EVENT

복수 값이 필요한 경우 배열로 작성한다.

## processingType enum

- SYNC
- ASYNC
- POLLING
- STREAMING
- CLIENT_ONLY
- UNKNOWN

## Feature ID

다음 형식을 사용한다.

`FEAT-{DOMAIN_CODE}-{SEQUENCE}`

예:

`FEAT-USR-0001`
