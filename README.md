# 병역명문가 혜택찾기

경기도 지역과 업종을 선택해 병역명문가 예우시설과 감면 내용을 확인하는 모바일 우선 반응형 웹 서비스. 대화형 AI 서비스가 아니며, 담당자가 확인한 예우시설 데이터를 지역·업종·시설명 조건으로 정확하게 필터링해 보여주는 공공정보 안내 서비스다.

## 기술 스택

React 18 · TypeScript(strict) · Vite · Tailwind CSS · React Router v6 · Vitest/React Testing Library · Playwright

## 요구 사항

- Node.js LTS (v20 이상 권장, 개발 시 v24.18.0 사용)

## 설치

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

`http://localhost:5173`에서 접속한다. 개발 전용 디자인 시스템 확인 페이지는 `/dev/styleguide`(프로덕션 빌드에는 포함되지 않음).

## 데이터 갱신

1. 정제된 예우시설 엑셀 파일을 `data-source/경인_예우시설_2026_4_30_업데이트_정리.xlsx` 경로에 덮어쓴다.
2. 변환 스크립트를 실행한다.

```bash
npm run convert:data
```

`public/data/facilities.json`이 재생성되며, 총 건수·공개 건수·비공개(needs_review) 건수·필드 보유 통계가 콘솔에 출력된다. 미정의 지역·업종값이 발견되면 변환이 **중단**된다(조용한 보정 없음) — 오류 목록을 확인하고 [src/data/regionConfig.ts](src/data/regionConfig.ts) / [src/data/categoryConfig.ts](src/data/categoryConfig.ts)의 매핑을 담당자와 함께 검토한다.

데이터 갱신 후에는 `npm test`로 [src/data/facilities.test.ts](src/data/facilities.test.ts)의 검증(총 건수, 공개 건수, 광역 매핑, 필드 통계, 비고 원문 표본)이 여전히 유효한지 확인한다. 수치가 바뀌면 테스트가 실패하며, 이는 의도된 변경인지 담당자 확인이 필요하다는 신호다.

## 빌드

```bash
npm run build
```

TypeScript 타입 검사 후 `dist/`에 정적 파일을 생성한다. 백엔드 없이 정적 호스팅(Nginx, S3+CloudFront, Netlify 등)에 배포 가능하다.

```bash
npm run preview
```

빌드 산출물을 로컬에서 미리 확인한다(`http://localhost:4173`).

## 테스트

```bash
npm test           # 단위·컴포넌트 테스트 (Vitest)
npm run test:watch # 감시 모드
npm run test:e2e   # E2E (Playwright, mobile-390/tablet-768/desktop-1440 3뷰포트)
```

E2E는 `npm run preview` 서버를 자동으로 기동한다. 최초 실행 시 브라우저 설치가 필요하면:

```bash
npx playwright install chromium
```

## 프로젝트 구조

```
data-source/     정제 엑셀 원본 보관
scripts/         엑셀 → JSON 변환 스크립트
public/data/     변환된 시설 데이터(facilities.json)
src/
  app/           라우터, 앱 골격
  components/    공통·지역·업종·시설·후속기능 컴포넌트
  data/          지역·업종 설정(코드·표시명·매핑)
  hooks/         포커스 이동, 데이터 로딩, 상태 복원
  lib/           유틸리티, 데이터 변환 순수 함수, 세션 저장소
  pages/         화면 단위 페이지
  services/      필터링, 외부 링크, 데이터 저장소
  types/         전역 타입 정의
tests/e2e/       Playwright 시나리오
docs/            PRD, 아키텍처, 구현계획, 검수 보고서
```

## 문서

- [docs/ITERATION_1_REPORT.md](docs/ITERATION_1_REPORT.md) — PRD 검증 및 확정 결정
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 기술 아키텍처
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) — Sprint별 구현계획
- [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) — 출시 전 최종 검수 체크리스트

## 이번 MVP 범위 제외

가까운 군마트 실제 검색, 병역명문가 신청 실제 연동, 관리자 엑셀 업로드, 로그인/즐겨찾기, AI 추천, 경기도 행정구역 지도(SVG) — 상세는 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §13 참조.
