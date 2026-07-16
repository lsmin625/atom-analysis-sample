# Feature Analysis Validation Checklist

## Routes

- [ ] 모든 정적 라우트를 분류했는가?
- [ ] 동적 라우트를 확인했는가?
- [ ] 중첩 라우트를 확인했는가?
- [ ] 메뉴 없는 직접 접근 라우트를 확인했는가?
- [ ] redirect와 alias를 구분했는가?

## Pages

- [ ] 모든 page와 view 파일을 분석했는가?
- [ ] 동적 import 화면을 분석했는가?
- [ ] 라우트 없는 모달 전용 화면을 분석했는가?
- [ ] 공통 컴포넌트의 실제 사용 화면을 연결했는가?

## User actions

- [ ] 버튼 클릭을 분류했는가?
- [ ] 폼 제출을 분류했는가?
- [ ] 테이블 행 액션을 분류했는가?
- [ ] 탭 내부 기능을 분석했는가?
- [ ] 키보드와 필드 변경 이벤트를 분석했는가?

## APIs and stores

- [ ] 모든 API 서비스 함수를 분류했는가?
- [ ] 컴포넌트에서 직접 호출한 HTTP 요청을 확인했는가?
- [ ] store action을 기능에 연결했는가?
- [ ] 호출되지 않는 API를 구분했는가?

## Permissions

- [ ] route guard를 확인했는가?
- [ ] 메뉴 권한을 확인했는가?
- [ ] 버튼 표시 권한을 확인했는가?
- [ ] disabled 조건을 확인했는가?
- [ ] 역할별 기능 차이를 기록했는가?

## Special functions

- [ ] 업로드를 확인했는가?
- [ ] 다운로드와 export를 확인했는가?
- [ ] 인쇄를 확인했는가?
- [ ] polling과 timer를 확인했는가?
- [ ] WebSocket과 EventSource를 확인했는가?
- [ ] 세션 만료 및 인증 처리를 확인했는가?

## Final reconciliation

모든 대상을 다음 중 하나로 분류한다.

- application feature
- supporting UI behavior
- shared technical behavior
- dead or unused code
- unresolved
