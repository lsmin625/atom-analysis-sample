# atom-analysis-sample

간단한 개요

이 저장소는 OpenAPI/OAS 관련 프론트엔드 및 백엔드 샘플 소스와 분석 결과물을 함께 담고 있는 예제 프로젝트입니다. 주요 목적은 OAS 문서와 UI/서버 구성요소를 분석하고, 프론트엔드 기반의 분석 리포트를 생성하는 것입니다.

주요 폴더

- `frontend-analysis-output/` : 자동 생성된 분석 리포트(coverage, feature-catalog 등).
- `inputs/oas-doc-api/` : 백엔드 API 샘플(자바/메이븐 기반). `pom.xml`과 Maven Wrapper(`mvnw`) 포함.
- `inputs/oas-doc-ui/` : 프론트엔드 샘플(Vite + TypeScript). `package.json`, `vite.config.ts` 등 포함.
- `prompts/` : 분석/검증에 사용한 프롬프트 및 문서 템플릿.
