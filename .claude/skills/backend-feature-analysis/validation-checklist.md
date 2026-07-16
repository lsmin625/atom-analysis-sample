# Backend Feature Analysis Validation Checklist

## Endpoints and routing

- [ ] 모든 컨트롤러/라우터의 엔드포인트를 분류했는가?
- [ ] HTTP 메서드와 경로(path variable, query)를 확인했는가?
- [ ] 클래스 레벨 + 메서드 레벨 매핑을 결합해 전체 경로를 산출했는가?
- [ ] 버전 프리픽스/컨텍스트 패스를 반영했는가?
- [ ] 매핑되었으나 미노출(내부 전용) 엔드포인트를 구분했는가?

## Request processing flow

- [ ] controller → service → repository 호출 경로를 추적했는가?
- [ ] 서비스 메서드의 업무 로직을 기능으로 연결했는가?
- [ ] 트랜잭션 경계(@Transactional 등)를 확인했는가?
- [ ] 동기/비동기 처리를 구분했는가?

## Data access and domain

- [ ] 모든 repository/DAO 메서드와 쿼리를 분류했는가?
- [ ] raw SQL / JPQL / ORM 쿼리를 확인했는가?
- [ ] 엔터티/테이블과 스키마(`*.sql`, migration)를 연결했는가?
- [ ] 호출되지 않는(dead) 쿼리/메서드를 구분했는가?

## Authentication and authorization

- [ ] 인증 방식(세션/JWT/OAuth)을 확인했는가?
- [ ] 토큰 발급/검증/갱신 경로를 확인했는가?
- [ ] 메서드/엔드포인트 권한(@PreAuthorize, 가드, 필터)을 확인했는가?
- [ ] 역할·스코프별 접근 차이를 기록했는가?
- [ ] 인증 없이 접근 가능한 공개 엔드포인트를 구분했는가?

## Validation and error handling

- [ ] 입력 검증(@Valid, 수동 검증)을 기능에 연결했는가?
- [ ] 전역 예외 처리(@ControllerAdvice 등)와 오류 응답 코드를 확인했는가?
- [ ] 도메인 예외와 HTTP 상태 매핑을 확인했는가?

## Integration and I/O

- [ ] 외부 HTTP/RPC/메시지 발행 호출을 확인했는가?
- [ ] 파일 업로드(Multipart)를 확인했는가?
- [ ] 다운로드/내보내기(Excel/CSV/PDF, StreamingResponse)를 확인했는가?
- [ ] 캐싱/레이트리밋/감사 로깅(AOP, interceptor)을 확인했는가?

## Background triggers

- [ ] @Scheduled / 배치 / 메시지 리스너 존재 여부를 확인했는가?
- [ ] 백그라운드 성격 기능은 `background-feature-analysis`로 이관 판단했는가?

## Configuration and tests

- [ ] 설정 프로퍼티(`application.yml` 등)와 기능 동작 연관을 확인했는가?
- [ ] 테스트 코드의 시나리오를 기능 근거로 확인했는가?

## Final reconciliation

모든 대상을 다음 중 하나로 분류한다.

- application feature
- supporting technical behavior (필터/인터셉터/공통 유틸)
- shared infrastructure (설정, 공통 응답 래퍼)
- dead or unused code
- unresolved
