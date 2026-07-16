# 병역명문가 혜택찾기 — 구현계획 및 테스트 계획

- 기준 문서: docs/ARCHITECTURE.md (승인본), docs/ITERATION_1_REPORT.md 확정 결정
- 작성일: 2026-07-16
- 구현 순서 원칙: **데이터 → 화면 → 상호작용 → 접근성 → 검수**
- 공통 규칙: 각 Sprint는 시작 보고 → 구현 → 완료 보고 후 정지. 사용자 승인 후 다음 Sprint 진행.

## 범위 주석 (확정 반영)

- 지도 SVG·모바일 토글(FR-003, FR-005, AC-001, AC-003)은 이번 개발 단계에서 제외 — 지역 선택은 이름 목록 단일 방식.
- 경기도 광역 4건은 전 시·군 체육 목록에 공통 표출 + "경기도 운영 시설" 배지.
- 공개 데이터: 440건 중 438건 (감면 내용 누락 2건 needs_review 비공개).
- **선행 조건: Node.js LTS 설치 (현재 PC 미설치)** — Sprint 0 진입 전 필요.

---

## Sprint 0. 프로젝트 초기화

| 항목 | 내용 |
|---|---|
| 목표 | 빌드·테스트·린트가 작동하는 빈 앱 골격 |
| 사용자 가치 | 없음(개발 기반) |
| 구현 대상 | Vite+React+TS strict 프로젝트 생성, Tailwind·shadcn/ui 초기화, React Router 설치, Vitest+RTL+vitest-axe+Playwright 설정, 폴더 구조(ARCHITECTURE §2), `index.html lang="ko"` |
| 파일 | package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, src/app/App.tsx, src/app/routes.tsx, src/styles/globals.css(뼈대), tests/e2e/ 설정 |
| PRD 요구사항 | (기반) A11Y-001 |
| 인수조건 | - |
| 의존성 | Node.js LTS 설치 |
| 완료 조건 | `npm run dev`·`build`·`test`·`test:e2e` 모두 성공, TS 오류 0 |
| 단위 테스트 | 샘플 테스트 1개 통과(파이프라인 검증) |
| E2E | 루트 페이지 렌더 스모크 1개 |
| 접근성 테스트 | html lang="ko" 확인 |
| 수동 검수 | dev 서버 기동 확인 |
| 다음 진입 조건 | 전체 스크립트 무오류 |

## Sprint 1. 디자인 시스템과 공통 레이아웃

| 항목 | 내용 |
|---|---|
| 목표 | 토큰·타이포·공통 컴포넌트가 적용된 AppShell |
| 사용자 가치 | 모든 화면의 일관된 시각·접근성 기반 |
| 구현 대상 | CSS 변수 토큰 11종, 폰트 토큰(시스템 산세리프), 반응형 여백(15/18/28px, max 1180px), AppShell·SkipLink·ServiceHeader·ServiceFooter(기준일)·ProgressIndicator·LiveRegion·LoadingState·ErrorState, focus-visible 3px gold 전역 스타일, reduced-motion 미디어 쿼리, 버튼 상태 6종(PRD 9.1) |
| 파일 | src/styles/globals.css, tailwind.config.ts, src/components/common/* |
| PRD 요구사항 | FR-001, FR-002, FR-026, NFR-001~002, A11Y-002~005, A11Y-008, A11Y-012 |
| 인수조건 | AC-019, AC-020(기반) |
| 의존성 | Sprint 0 |
| 완료 조건 | 스타일가이드 데모 라우트에서 토큰·컴포넌트 확인, 390px 넘침 없음 |
| 단위 테스트 | ProgressIndicator 접근명(“3단계 중 n단계”), Footer 기준일 표시 |
| E2E | 390px/1440px 레이아웃 스모크 |
| 접근성 테스트 | SkipLink 포커스 이동, axe 위반 0, reduced-motion에서 transition 제거 |
| 수동 검수 | 토큰 색상 대비 AA 확인(navy/ink/muted on paper/surface) |
| 다음 진입 조건 | axe 0건, 반응형 스모크 통과 |

## Sprint 2. 예우시설 데이터 변환 및 검증

| 항목 | 내용 |
|---|---|
| 목표 | 엑셀 → facilities.json 파이프라인과 검증 통과 |
| 사용자 가치 | 정확한 실데이터 438건 (가상 데이터 0) |
| 구현 대상 | scripts/convert-data.ts(변환 규칙 11종 — ARCHITECTURE §7), regionConfig(31 시·군)·categoryConfig(7 업종), types/index.ts 전 타입, facilityRepository·useFacilityData(로딩/오류/재시도), 변환 리포트 출력 |
| 파일 | scripts/convert-data.ts, src/data/regionConfig.ts, src/data/categoryConfig.ts, src/types/index.ts, src/services/facilityRepository.ts, src/hooks/useFacilityData.ts, public/data/facilities.json(산출물) |
| PRD 요구사항 | FR-023, 10.3~10.7 전체, NFR-009 |
| 인수조건 | AC-010(데이터 측), AC-017 |
| 의존성 | Sprint 0 |
| 완료 조건 | 총 440건 로드·published 438건·isProvincial 4건·미정의 지역/업종 0건, 비고 원문 엑셀 대조 일치 |
| 단위 테스트 | 공백/null/`-`/오류 문자열 변환, URL 검증, 전화 파싱 4규칙(이상값 4건 실데이터 케이스), 따옴표 정제, needs_review 분류, 업종 정확히 7개, 중복 경고 |
| E2E | - (데이터 계층) |
| 접근성 테스트 | - |
| 수동 검수 | 변환 리포트 수치를 PRD 10.1과 대조(URL 85·비고 376·전화 가능 86 등), 샘플 10건 원문 육안 대조 |
| 다음 진입 조건 | 데이터 검증 테스트 전체 통과 |

## Sprint 3. 지역 선택 (목록 단일 방식)

| 항목 | 내용 |
|---|---|
| 목표 | 첫 화면에서 지역을 선택해 업종 화면으로 이동 |
| 사용자 가치 | 탐색 흐름의 시작 |
| 구현 대상 | RegionSelectionPage(확정 카피, 진행 1/3), RegionList/Item(가나다순, 48px, ul/li+button), 선택 즉시 `/region/:code` 이동, ComingSoonSection(군마트·신청, 비상호작용+“준비 중” 배지), useFocusOnNavigate |
| 파일 | src/pages/RegionSelectionPage.tsx, src/components/region/*, src/components/feedback/*, src/hooks/useFocusOnNavigate.ts |
| PRD 요구사항 | FR-001, FR-004, FR-006, FR-024, A11Y-009 |
| 인수조건 | AC-002 |
| 의존성 | Sprint 1, 2 |
| 완료 조건 | 31개 지역 표시, 선택 시 URL 이동+포커스 이동, 준비 중 카드 비상호작용 |
| 단위 테스트 | 가나다 정렬, regionConfig 공개 필터 |
| E2E | 지역 선택 → 업종 화면 이동, 새로고침 시 업종 화면 유지 |
| 접근성 테스트 | 키보드 선택, 이동 후 h1 포커스, 준비 중 카드가 탭 순서에 없음, axe 0 |
| 수동 검수 | 390px 1열 목록, 카피 원문 일치 |
| 다음 진입 조건 | E2E·axe 통과 |

## Sprint 4. 업종 선택

| 항목 | 내용 |
|---|---|
| 목표 | 지역 내 7개 업종 선택 |
| 사용자 가치 | 원하는 시설 유형으로 즉시 진입 |
| 구현 대상 | CategorySelectionPage(“{지역}에서 어떤 시설을 찾으세요?”, 진행 2/3), CategoryButton 7개(번호+선형 아이콘+이름+시설 수), 빈 업종 disabled+“등록 시설 없음”, 지역별 카운트(경기도 공통 4건 포함), 반응형 1/2/3열, 등장 모션(450ms·35ms 간격·reduced-motion 제거) |
| 파일 | src/pages/CategorySelectionPage.tsx, src/components/category/*, src/services/filterService.ts(카운트) |
| PRD 요구사항 | FR-007, FR-008, FR-009, FR-025, A11Y-011 |
| 인수조건 | AC-004(진입), AC-005, AC-006 |
| 의존성 | Sprint 3 |
| 완료 조건 | 정확히 7개·전체 보기 부재·빈 업종 비활성·카운트 정확 |
| 단위 테스트 | filterService 지역별 업종 카운트(경기도 공통 표출 포함 — 예: 부천 체육=4), 빈 업종 판정 |
| E2E | 업종 선택 → 목록 이동, 빈 업종 클릭 불가 |
| 접근성 테스트 | disabled 버튼 포커스 제외, 시각=DOM 순서, axe 0 |
| 수동 검수 | 3열 데스크톱 그리드, 모션 간격, hover/focus 상태 |
| 다음 진입 조건 | AC-005·006 검증 통과 |

## Sprint 5. 시설 목록과 시설명 검색

| 항목 | 내용 |
|---|---|
| 목표 | 필터된 시설 목록과 실시간 시설명 검색 |
| 사용자 가치 | 시설명·감면 내용 비교와 빠른 탐색 |
| 구현 대상 | FacilityListPage(진행 3/3), SelectionBreadcrumb({지역}>{업종} 경로 이동+상태 초기화 규칙), FacilitySearch(아이콘+입력+지우기, 공백 정리·부분 일치), 결과 건수 “총 n개 시설”+LiveRegion, FacilityList(구분선형 ul/li, 시설명 Bold 2줄·감면 내용 2~3줄, 화살표), 경기도 운영 시설 배지, EmptyResult(“찾는 시설이 없어요”+다른 업종 보기 / 지역 시설 없음 변형) |
| 파일 | src/pages/FacilityListPage.tsx, src/components/facility/FacilitySearch.tsx·FacilityList*.tsx·EmptyResult.tsx·SelectionBreadcrumb.tsx, src/services/filterService.ts(검색) |
| PRD 요구사항 | FR-010~013, FR-022, A11Y-007, NFR-004, NFR-006 |
| 인수조건 | AC-004, AC-007, AC-008 |
| 의존성 | Sprint 4 |
| 완료 조건 | 필터 정확(경기도 공통 포함), 검색 즉시 갱신, 결과 없음 상태 작동 |
| 단위 테스트 | 검색 정규화(앞뒤·연속 공백), 부분 일치, 지역×업종 필터(광역 포함), 건수 계산 |
| E2E | 검색 입력→목록·건수 갱신, 지우기 버튼, 결과 없음→다른 업종 보기 이동(지역 유지) |
| 접근성 테스트 | 건수 aria-live 알림, 검색 input 라벨, 행 전체 링크 접근명, axe 0 |
| 수동 검수 | 안성 체육 97건 스크롤 성능, 390px 목록 밀도 |
| 다음 진입 조건 | AC-007·008 통과 |

## Sprint 6. 시설 상세 및 외부 링크

| 항목 | 내용 |
|---|---|
| 목표 | 상세 정보 표시와 전화·홈페이지·지도 연결 |
| 사용자 가치 | 이용 가능 여부 판단과 즉시 행동 |
| 구현 대상 | FacilityDetailPage(표시 순서 9단계, 진행 표시 없음), FacilityVisual(업종 아이콘 4:3 영역), FacilityDescriptionList(dl/dt/dd — 없는 항목 숨김, 비고 원문·개행 보존), FacilityActionButtons(버튼 노출 매트릭스 8조합, 전무 시 영역 숨김+시·군청 문의 안내 분기), externalLink 서비스(tel/새 탭/네이버 지도 URL 인코딩, noopener noreferrer, 실패 시 상태 유지+LiveRegion), 하단 안내 카피, 기관구분 미노출 |
| 파일 | src/pages/FacilityDetailPage.tsx, src/components/facility/FacilityVisual.tsx·FacilityDescriptionList.tsx·FacilityActionButtons.tsx, src/services/externalLink.ts |
| PRD 요구사항 | FR-014~020, NFR-005, NFR-008, 16.5, 18.1 |
| 인수조건 | AC-009~015 |
| 의존성 | Sprint 5 |
| 완료 조건 | 노출 매트릭스 8조합 전부 규칙대로, 비고 원문 일치 |
| 단위 테스트 | externalLink URL 생성·인코딩(한글 주소), 매트릭스 8조합 노출 판정, 비고 null 숨김 |
| E2E | 상세 진입→정보 표시, 전화/홈페이지/지도 버튼 href·target·rel 검증, 버튼 없는 시설(122건 중 1건)에서 영역 부재 확인 |
| 접근성 테스트 | dl 구조, 버튼 접근명(“전화하기” 등), axe 0 |
| 수동 검수 | 네이버 지도 검색 결과 실기기 확인 3건, 비고 개행 표시, 데스크톱 2열 레이아웃 |
| 다음 진입 조건 | AC-009~015 통과 |

## Sprint 7. 상태 복원과 오류 처리

| 항목 | 내용 |
|---|---|
| 목표 | 뒤로가기·새로고침 상태 유지와 전 오류 상태 완성 |
| 사용자 가치 | 탐색 흐름이 끊기지 않음 |
| 구현 대상 | useListStateRestore(검색어·스크롤 sessionStorage 저장·복원, 키 `list:{region}:{category}`), breadcrumb 이동 시 초기화 규칙(5.4), 데이터 로드 실패 ErrorState+다시 시도, 잘못된 URL NotFoundPage, 외부 링크 실패 처리 마감, 지역 시설 없음 상태(6.1.3) |
| 파일 | src/hooks/useListStateRestore.ts, src/pages/NotFoundPage.tsx, 관련 페이지 보강 |
| PRD 요구사항 | FR-021, FR-023, 5.4, 13 전체, NFR-008 |
| 인수조건 | AC-016, AC-017 |
| 의존성 | Sprint 6 |
| 완료 조건 | 상세→목록 복귀 시 검색어·스크롤 복원, 오류 화면에 내부 용어 없음 |
| 단위 테스트 | 세션 키 저장·복원·초기화 규칙, 잘못된 코드 판정 |
| E2E | 상세→뒤로가기 복원, 브라우저 뒤로가기 동일 동작, 새로고침 유지, fetch 실패 모킹→다시 시도 성공 |
| 접근성 테스트 | ErrorState 포커스·버튼 접근명 |
| 수동 검수 | 오류 문구에 기술 용어·오류코드 부재 |
| 다음 진입 조건 | AC-016·017 통과 |

## Sprint 8. 접근성 및 반응형 검수

| 항목 | 내용 |
|---|---|
| 목표 | 접근성·반응형 요구 전체 충족 확인과 보완 |
| 사용자 가치 | 고령·키보드·스크린리더 사용자 완주 가능 |
| 구현 대상 | 키보드 전체 흐름 점검·보완, 포커스 순서·표시, 200% 확대 보완, 터치 영역 실측, 대비 실측, reduced-motion 전수 확인, 콘솔 로그·미사용 코드 제거 |
| 파일 | 전 컴포넌트 보완 |
| PRD 요구사항 | A11Y-001~012, 12.3 시나리오 4종, NFR-001·002·007 |
| 인수조건 | AC-018, AC-019, AC-020 |
| 의존성 | Sprint 7 |
| 완료 조건 | 12.3 시나리오 4종 통과 |
| 단위 테스트 | - (보완 회귀만) |
| E2E | 키보드 전용 완주 시나리오, 390/768/1440 뷰포트, reduced-motion, 200% 확대(뷰포트 절반 에뮬레이션) |
| 접근성 테스트 | 전 페이지 axe 0, 수동 스크린리더 시나리오(진행 단계·건수·버튼 행동 낭독) |
| 수동 검수 | 삼성 인터넷/Safari 확인(가능 범위), 실기기 1대 터치 확인 |
| 다음 진입 조건 | AC-018~020 통과 |

## Sprint 9. 통합 테스트와 배포 준비

| 항목 | 내용 |
|---|---|
| 목표 | 출시 차단 조건 전수 점검과 정적 배포 산출물 |
| 사용자 가치 | 신뢰 가능한 공개 버전 |
| 구현 대상 | 테스트 필수 조건 23항(사용자 지시 §13) 전수 실행, 출시 차단 조건 14항(§14) 점검표 작성, DEMO 데이터 부재 확인, 프로덕션 빌드·프리뷰 검증, README(설치·실행·데이터 갱신 절차) |
| 파일 | README.md, docs/RELEASE_CHECKLIST.md, 빌드 산출물 dist/ |
| PRD 요구사항 | 15.1 최종 검수 체크리스트, 17.4 |
| 인수조건 | AC-001~020 중 적용 대상 전체(지도 제외분 명시) |
| 의존성 | Sprint 8 |
| 완료 조건 | 체크리스트 전 항목 통과 또는 보류 사유 문서화(폰트 라이선스 등 담당자 확정 대기 항목) |
| 단위 테스트 | 전체 회귀 |
| E2E | 프로덕션 빌드 대상 전체 E2E |
| 접근성 테스트 | 최종 axe 전수 |
| 수동 검수 | 최종 검수 체크리스트 12항(PRD 15.1) 서명 |
| 다음 진입 조건 | (완료) 담당자 공개 승인 |

---

## 테스트 ↔ 출시 차단 조건 매핑 요약

| 출시 차단 조건 | 검증 위치 |
|---|---|
| 비고 원문 변경 | Sprint 2 스냅샷 대조 + Sprint 6 AC-010 |
| 7개 이외 업종 / 전체 보기 | Sprint 4 단위·E2E |
| 키보드 완주 불가 | Sprint 8 키보드 E2E |
| 390px 가로 넘침 | Sprint 1·8 뷰포트 E2E |
| 데이터 없는 버튼 노출 | Sprint 6 매트릭스 테스트 |
| 필수값 누락 시설 공개 | Sprint 2 needs_review 테스트 |
| 가상 데이터 혼입 | Sprint 9 DEMO 표기 전수 검색 |
| 테스트·빌드·TS 오류 | 매 Sprint CI 기준 |
| 폰트·지도·로고 권한 | Sprint 9 체크리스트(담당자 확정 항목) |
