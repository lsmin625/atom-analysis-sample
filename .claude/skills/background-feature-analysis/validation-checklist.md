# Background Feature Analysis Validation Checklist

## Triggers

- [ ] 모든 스케줄(@Scheduled/cron/fixedRate/fixedDelay)을 분류했는가?
- [ ] 모든 메시지 리스너(토픽/큐/컨슈머 그룹)를 확인했는가?
- [ ] 이벤트 핸들러/도메인 이벤트 구독을 확인했는가?
- [ ] 워커 루프/데몬/시작 시 1회 실행 작업을 확인했는가?
- [ ] 비활성(disabled)·주석·미등록 트리거를 구분했는가?

## Processing flow

- [ ] 트리거 → 처리 로직(job/step/handler/service) 경로를 추적했는가?
- [ ] 배치의 reader/processor/writer 흐름을 확인했는가?
- [ ] chunk/tasklet 등 처리 단위를 확인했는가?
- [ ] 트랜잭션 경계와 커밋 간격을 확인했는가?

## Data and state

- [ ] 데이터 접근(repository/query)을 기능에 연결했는가?
- [ ] 체크포인트/오프셋/커서 등 진행 상태 저장을 확인했는가?
- [ ] 처리 결과의 적재/발행 대상을 확인했는가?

## Reliability

- [ ] 재시도/백오프 정책을 확인했는가?
- [ ] 데드레터/실패 큐 처리를 확인했는가?
- [ ] 멱등성/중복 실행 방지 조건을 확인했는가?
- [ ] 동시성/단일 실행 락(ShedLock 등)을 확인했는가?
- [ ] 다중 인스턴스 배포 시 중복 실행 위험을 기록했는가?

## Integration and I/O

- [ ] 외부 HTTP/RPC/메시지 발행 호출을 확인했는가?
- [ ] 파일 입력(대량 적재)을 확인했는가?
- [ ] 파일/리포트 생성 및 전송을 확인했는가?

## Error handling and monitoring

- [ ] 예외 처리와 알림(alerting) 경로를 확인했는가?
- [ ] 메트릭/로깅으로 실행 결과를 관측 가능한지 확인했는가?

## Configuration and tests

- [ ] 스케줄/배치 크기/임계치 등 설정 프로퍼티를 기능과 연결했는가?
- [ ] 테스트 코드의 시나리오를 기능 근거로 확인했는가?

## Final reconciliation

모든 대상을 다음 중 하나로 분류한다.

- application feature (자동 처리 기능)
- supporting technical behavior (공통 스케줄 설정/리스너 인프라)
- shared infrastructure (설정, 커넥션, 직렬화)
- dead or disabled code (미등록/비활성 트리거)
- unresolved
