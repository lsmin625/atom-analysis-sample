frontend-feature-analyst 에이전트를 사용하여 현재 저장소의
프론트엔드 전체 기능을 분석하라.

frontend-feature-analysis Skill과 저장소의 CLAUDE.md를 준수하라.

이번 분석 범위는 운영 코드 전체이며 다음을 포함한다.

- 정적 및 동적 라우트
- 메뉴와 직접 URL 접근
- 화면, 모달, 탭 및 테이블 행 액션
- API와 Pinia store
- 역할 및 권한
- validation과 오류 처리
- 업로드, 다운로드, export, print
- 페이지 자동 실행, polling 및 WebSocket
- 테스트 코드의 사용자 시나리오

초기 목록을 생성한 후 독립적으로 누락 검증을 수행하라.
결과는 analysis-output 디렉터리에 저장하라.
애플리케이션 원본 소스는 수정하지 마라.

분석 결과중 feature-catalog.json 데이터는 db-saver 도구를 이용해서 저장해라.