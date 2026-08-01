# 병역명문가 혜택찾기 — 웹앱 아키텍처 명세

- 기준 문서: PRD v1.0 + Iteration 1 확정 결정(docs/ITERATION_1_REPORT.md)
- 기준 데이터: 경인_예우시설_2026_4_30_업데이트_정리.xlsx (정제본, 440건 / 공개 438건)
- 작성일: 2026-07-16
- 확정 반영: 지도 SVG 제외(목록 단일 방식), 경기도 광역 4건 전 시·군 공통 표출, 감면 누락 2건 비공개

---

## 1. 기술 스택

| 기술 | 선택 이유 | 제외한 대안과 사유 |
|---|---|---|
| **React 18 + TypeScript (strict)** | 컴포넌트 단위 접근성 구현, 상태-화면 분리, PRD 16.4의 shadcn/ui 대응표와 정합 | Vue/Svelte — 사용자 지시로 React 확정. 순수 HTML/JS 3파일 초안 — 상태 복원·라우팅 요구를 감당하기 어려움 |
| **Vite** | 빠른 개발 서버, 정적 빌드 산출물(백엔드 불필요), TS·Tailwind 기본 지원 | CRA(유지보수 종료), Next.js(SSR 불필요 — 정적 데이터 안내 서비스) |
| **Tailwind CSS** | PRD 디자인 토큰을 theme 설정으로 1곳에서 관리, 인라인 스타일 금지 규칙과 부합 | CSS Modules — 토큰 반복 하드코딩 위험. styled-components — 런타임 비용 불필요 |
| **shadcn/ui** | Toggle·Badge·Separator·Input 등 PRD 16.4 대응 컴포넌트, 코드 소유 방식이라 접근성 커스터마이즈 용이 | MUI/AntD — 디자인 방향(행정 아카이브 톤)과 불일치, 번들 과대 |
| **lucide-react** | 일관된 굵기의 선형 아이콘(업종 7종 + UI 아이콘) | 이모지·이미지 아이콘 — 일관성·접근성 미달 |
| **React Router v6** | URL 경로로 지역·업종 상태 관리(새로고침·뒤로가기 복원 요구), 정적 호스팅 호환 | TanStack Router — 팀 친숙도 대비 이점 없음 |
| **정적 JSON (facilities.json)** | 승인 데이터의 읽기 전용 안내 서비스, 백엔드 금지 요구 | Supabase/Firebase — MVP 제외 명시 |
| **Vitest + React Testing Library** | Vite 네이티브 단위·컴포넌트 테스트 | Jest — Vite 연동 설정 비용 |
| **Playwright** | 키보드 흐름·반응형·외부 링크 E2E, 모바일 뷰포트 에뮬레이션 | Cypress — 다중 뷰포트·탭 검증이 Playwright가 우수 |
| **vitest-axe(axe-core)** | 컴포넌트 수준 접근성 자동 검사 | 수동 검수만 — 회귀 방지 불가 |

**전역 상태관리 라이브러리 불사용**: 상태는 URL(지역·업종·시설) + 지역 컴포넌트 상태 + sessionStorage(검색어·스크롤)로 충분하다. Redux/Zustand 등은 도입하지 않는다.

## 2. 프로젝트 폴더 구조

```
MMA/
├─ docs/                      # ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, 이터레이션 보고서
├─ scripts/
│  └─ convert-data.ts         # 엑셀 → facilities.json 변환·검증 (빌드 전 실행, Node)
├─ public/
│  └─ data/
│     └─ facilities.json      # 변환 산출물 (앱 진입 시 1회 fetch)
├─ src/
│  ├─ app/
│  │  ├─ App.tsx              # 라우터·AppShell 구성
│  │  └─ routes.tsx           # 경로 정의
│  ├─ components/
│  │  ├─ common/              # SkipLink, ServiceHeader, ServiceFooter, ProgressIndicator,
│  │  │                       # LiveRegion, LoadingState, ErrorState, Badge류
│  │  ├─ region/              # RegionList, RegionListItem
│  │  │                       # (후속: GyeonggiMap, RegionModeToggle 슬롯)
│  │  ├─ category/            # CategoryGrid, CategoryButton
│  │  ├─ facility/            # SelectionBreadcrumb, FacilitySearch, FacilityList,
│  │  │                       # FacilityListItem, EmptyResult, FacilityVisual,
│  │  │                       # FacilityDescriptionList, FacilityActionButtons
│  │  └─ feedback/            # ComingSoonSection, ComingSoonCard
│  ├─ pages/                  # RegionSelectionPage, CategorySelectionPage,
│  │                          # FacilityListPage, FacilityDetailPage, NotFoundPage
│  ├─ data/
│  │  ├─ regionConfig.ts      # 31개 시·군 코드·표시명·공개 여부·정렬
│  │  └─ categoryConfig.ts    # 7개 업종 코드·표시명·아이콘 매핑
│  ├─ services/
│  │  ├─ facilityRepository.ts # facilities.json 로드·캐시·공개 필터(isActive)
│  │  ├─ filterService.ts      # 지역·업종·시설명 검색 (경기도 공통 표출 규칙 포함)
│  │  └─ externalLink.ts       # tel URI, 홈페이지, 네이버 지도 URL 생성
│  ├─ hooks/
│  │  ├─ useFacilityData.ts    # 로딩/성공/실패 상태
│  │  ├─ useListStateRestore.ts# 검색어·스크롤 저장·복원 (sessionStorage)
│  │  └─ useFocusOnNavigate.ts # 화면 전환 시 제목 포커스 이동
│  ├─ lib/                     # cn(), 문자열 정규화, sessionStorage 래퍼
│  ├─ types/
│  │  └─ index.ts              # Facility, Region, Category 등 전 타입
│  ├─ styles/
│  │  └─ globals.css           # 토큰 CSS 변수, reduced-motion, 포커스 스타일
│  └─ assets/                  # 업종 아이콘 매핑 등 (지도 SVG는 후속)
├─ tests/
│  └─ e2e/                     # Playwright 시나리오
├─ index.html                  # lang="ko"
└─ tailwind.config.ts / vite.config.ts / tsconfig.json
```

## 3. 화면 및 라우팅 구조

| 경로 | 화면 | 진행 표시 |
|---|---|---|
| `/` | 지역 선택 (RegionSelectionPage) | 1 / 3 |
| `/region/:regionCode` | 업종 선택 (CategorySelectionPage) | 2 / 3 |
| `/region/:regionCode/:categoryCode` | 시설 목록 (FacilityListPage) | 3 / 3 |
| `/facility/:facilityId` | 시설 상세 (FacilityDetailPage) | 표시 안 함 |
| 그 외 | NotFoundPage — 첫 화면으로 이동 안내 | - |

**상태 유지 규칙**
- 지역·업종은 URL 경로에 있으므로 새로고침·공유·뒤로가기에서 항상 복원된다.
- 시설 상세 → 뒤로가기 시 목록 URL로 복귀하며, 검색어·스크롤은 sessionStorage에서 복원한다(키: `list:{regionCode}:{categoryCode}`).
- 목록 경로(breadcrumb)에서 지역 선택 → `/` 이동 + 해당 목록 세션 상태 초기화. 업종 선택 → `/region/:regionCode` 이동(지역 유지).
- 유효하지 않은 regionCode/categoryCode/facilityId는 NotFoundPage 처리(내부 오류 미노출).
- 시설 상세 URL로 직접 진입한 경우 breadcrumb으로 해당 시설의 목록 경로를 구성한다(경기도 공통 시설은 "경기도 운영" 표기).

## 4. 컴포넌트 트리

```
AppShell
├─ SkipLink
├─ ServiceHeader
├─ main#main-content
│  ├─ (route) RegionSelectionPage
│  │  ├─ ProgressIndicator (1/3)
│  │  ├─ RegionList → RegionListItem×N
│  │  └─ ComingSoonSection → ComingSoonCard×2
│  ├─ (route) CategorySelectionPage
│  │  ├─ ProgressIndicator (2/3)
│  │  └─ CategoryGrid → CategoryButton×7
│  ├─ (route) FacilityListPage
│  │  ├─ ProgressIndicator (3/3)
│  │  ├─ SelectionBreadcrumb
│  │  ├─ FacilitySearch
│  │  ├─ FacilityList → FacilityListItem×N
│  │  └─ EmptyResult (검색 결과 없음 / 지역 시설 없음)
│  └─ (route) FacilityDetailPage
│     ├─ FacilityVisual
│     ├─ FacilityDescriptionList
│     └─ FacilityActionButtons
├─ ServiceFooter (데이터 기준일)
├─ LiveRegion (aria-live="polite")
├─ LoadingState / ErrorState (데이터 로드 단계)
└─ (후속 슬롯) RegionModeToggle, GyeonggiMap
```

| 컴포넌트 | 책임 | 주요 props | 상태 의존 |
|---|---|---|---|
| AppShell | 공통 레이아웃, 최대 폭 1180px, 여백 규칙 | children | 없음 |
| SkipLink | 본문 바로가기 (#main-content) | - | 없음 |
| ServiceHeader | 서비스명, 홈 링크 | - | 없음 |
| ServiceFooter | 데이터 기준일(2026. 4. 30.), 안내 문구 | dataUpdatedAt | 없음 |
| ProgressIndicator | 시각 1/3 표시 + "3단계 중 1단계: 지역 선택" 접근명 | step(1~3) | 없음 |
| RegionSelectionPage | 제목·설명·질문 카피, 지역 목록 렌더 | - | regionConfig, 시설 데이터(빈 지역 판단) |
| RegionList / RegionListItem | 가나다순 지역 버튼 목록(ul/li), 선택 시 즉시 이동 | regions | navigate |
| CategorySelectionPage | "{지역}에서 어떤 시설을 찾으세요?" | - | regionCode(URL), 지역별 업종 카운트 |
| CategoryButton | 번호+아이콘+업종명+시설 수, 0건이면 disabled + "등록 시설 없음" | category, count | 없음 |
| FacilityListPage | 필터·검색·목록 조립, 상태 복원 | - | regionCode·categoryCode(URL), 검색어, 스크롤 |
| SelectionBreadcrumb | {지역} > {업종} 경로 이동 | region, category | navigate |
| FacilitySearch | 아이콘+입력+지우기, 즉시 필터 | value, onChange | 검색어 |
| FacilityList / FacilityListItem | 구분선형 목록(ul/li), 시설명+감면 내용+화살표, 경기도 배지 | facilities | navigate |
| EmptyResult | "찾는 시설이 없어요" / "이 지역에는 등록된 시설이 없어요" + CTA | variant | navigate |
| FacilityDetailPage | 상세 조립, 표시 순서 규칙 | - | facilityId(URL) |
| FacilityVisual | 사진 없으면 업종 선형 아이콘 영역 | facility | 없음 |
| FacilityDescriptionList | dl/dt/dd — 지역·시설명·우대 대상·감면 내용·비고·주소·연락처, 없는 항목 숨김 | facility | 없음 |
| FacilityActionButtons | 전화/홈페이지/지도 — 유효 데이터만, 전무 시 영역 숨김 | facility | externalLink |
| ComingSoonSection/Card | 군마트·신청 준비 중, 비상호작용 + "준비 중" 배지 | - | 없음 |
| LoadingState | 데이터 최초 로드 중 표시 | - | useFacilityData |
| ErrorState | "최신 정보를 불러오지 못했어요" + 다시 시도하기 | onRetry | useFacilityData |
| LiveRegion | 결과 건수 등 스크린리더 알림 | message | 검색 결과 수 |
| (후속) RegionModeToggle, GyeonggiMap | 지도 선택 방식 — 이번 단계 미구현, 슬롯만 유지 | - | - |

## 5. TypeScript 타입

```ts
/** 화면 업종 코드 — 정확히 7개, 순서 고정 */
export type CategoryCode =
  | "education" | "culture" | "lodging" | "medical"
  | "parking" | "sports" | "etc";

export type RegionCode =
  | "suwon" | "seongnam" | "goyang" | "yongin" | "bucheon" | "ansan"
  | "anyang" | "namyangju" | "hwaseong" | "pyeongtaek" | "uijeongbu"
  | "siheung" | "paju" | "gwangmyeong" | "gimpo" | "gunpo" | "gwangju"
  | "icheon" | "yangju" | "osan" | "guri" | "anseong" | "pocheon"
  | "uiwang" | "hanam" | "yeoju" | "dongducheon" | "gwacheon"
  | "gapyeong" | "yangpyeong" | "yeoncheon";

export type BenefitType = "면제" | "할인";
export type FacilityDataStatus = "published" | "needs_review" | "inactive";
export type ExternalLinkType = "tel" | "homepage" | "map";

/** 원본 소스 식별자 — f: 경인지방병무청, n: 경기북부지청 */
export type SourceKey = "f" | "n";

/** 시·도 코드 — 전국 확장 대비. 현재는 경기도만 존재 */
export type ProvinceCode = "gyeonggi";

export interface Facility {
  facilityId: string;              // "{sourceKey}-{연번 3자리}" — 남부 f-001~, 북부 n-001~n-058
  sourceKey: SourceKey;            // 출처 추적용, 화면 미노출
  sourceRowNumber: number;         // 엑셀 연번 원본 — 소스가 다르면 값이 겹치므로 단독 키로 쓰지 않는다
  sourceRegion: string;            // 지역 원문 ("수원", "경기도" 등)
  isProvincial: boolean;           // 지역값이 "경기도"인 광역 시설 (전 시·군 공통 표출)
  displayRegionCode: RegionCode | null; // 광역 시설은 소재 시·군 코드(주소 기반 초안)
  displayRegionLabel: string;      // "수원시", 광역 시설은 "경기도"
  categorySource: string;          // 업종 원문 ("숙박·관광" 등)
  categoryCode: CategoryCode;
  categoryLabel: string;           // "숙박&관광" 등 화면 표시명
  facilityName: string;            // 원문 유지
  benefitTarget: string;           // 원문 유지
  benefitDescription: string;      // 원문 유지 — 개행 보존(줄 단위 공백만 정리)
  benefitType: BenefitType;
  organizationType: string | null; // 보존만, 기본 미노출
  note: string | null;             // 원문 유지 — 가공 금지
  homepageUrl: string | null;      // http/https 검증 통과 값만
  naverMapUrl?: string | null;     // 검증된 네이버지도 링크. 주소만으로 즉석 생성하지 않는다
  naverPlaceId: string | null;     // 수집된 소스만 보유 (MVP 화면 미사용)
  lat: number | null;              // 수집된 소스만 보유 (MVP 화면 미사용)
  lng: number | null;              // 수집된 소스만 보유 (MVP 화면 미사용)
  address: string | null;
  phoneDisplay: string | null;     // 원문 표시값
  phoneTel: string | null;         // tel: URI용 실행값 (없으면 버튼 미노출)
  imageUrl: string | null;         // MVP에서는 항상 null
  sourceUpdatedAt: string;         // "2026-04-30"
  dataStatus: FacilityDataStatus;
  isActive: boolean;               // false = 사용자 화면 제외
}

export interface Region {
  code: RegionCode;
  label: string;          // "수원시"
  provinceCode: ProvinceCode; // 현재 전부 "gyeonggi" — 전국 확장 시 코드 충돌 판별 기준
  sourceLabels: string[]; // 엑셀 원문 매칭값 ["수원"]
  isPublished: boolean;   // region_config 공개 제어
  sortOrder: number;      // 기본 가나다순
}

export interface Category {
  code: CategoryCode;
  label: string;
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  sourceLabels: string[]; // ["숙박·관광"] 등
  iconName: string;       // lucide 아이콘 식별자
}

/** URL이 기본 상태 저장소. 세션 복원 대상은 아래만. */
export interface AppRouteState {
  regionCode: RegionCode | null;   // URL
  categoryCode: CategoryCode | null; // URL
  facilityId: string | null;       // URL
  searchQuery: string;             // sessionStorage
  listScrollY: number;             // sessionStorage
}

export type FacilityDataLoad =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; facilities: Facility[]; dataUpdatedAt: string };
```

## 6. 데이터 스키마 — 엑셀 12컬럼 → 앱 필드 매핑

앞 12개 컬럼의 이름과 순서는 **모든 소스가 공유한다**. 소스가 늘어도 이 매핑은 그대로 재사용된다.

| 엑셀 컬럼 | 앱 필드 | 처리 |
|---|---|---|
| 연번 | sourceRowNumber, facilityId(`{sourceKey}-{연번 3자리}`) | 그대로. 연번은 소스별로 원본을 유지하며 재부여·오프셋하지 않는다 |
| 지역 | sourceRegion → displayRegionCode/Label, isProvincial | "경기도"면 isProvincial=true, 소재 시·군은 주소 기반 초안 매핑(수원·시흥·오산·화성) |
| 업종 | categorySource → categoryCode/Label | 7종 고정 매핑: 교육→education, 문화→culture, 숙박·관광→lodging(표시 "숙박&관광"), 의료→medical, 주차→parking, 체육→sports, 기타→etc |
| 시설명 | facilityName | 공백 정리 외 원문 유지 |
| 우대 대상 | benefitTarget | 원문 유지 |
| 감면 내용 | benefitDescription | 원문 유지. **개행 보존**(줄 단위로 공백만 정리 — `normalizeMultilineText`). **누락 시 dataStatus=needs_review, isActive=false** (f-039·f-041 해당) |
| 면제/할인 | benefitType | "면제"/"할인" 검증 |
| 기관구분 | organizationType | 원문 보존, 화면 미노출 |
| 비고 | note | **원문 그대로. 어떤 정규화도 적용하지 않음**(개행 포함 보존) |
| 홈페이지 URL | homepageUrl | http/https 검증, 실패 시 null |
| 주소 | address | "-"·빈값·엑셀 오류 문자열 → null, 따옴표 오염 제거 |
| 연락처 | phoneDisplay + phoneTel | 표시/실행 분리(§7 파싱 규칙) |
| (생성) | sourceKey, imageUrl=null, sourceUpdatedAt="2026-04-30", dataStatus, isActive | 변환 스크립트가 부여 |
| (별도 파일) | naverMapUrl, naverPlaceId, lat, lng | 소스별 지도 링크 JSON에서 연번으로 조인. `placeId`·`lat`·`lng`는 **선택 필드**로, 없으면 null |

## 7. 데이터 변환 규칙 (scripts/convert-data.ts)

빌드 전 1회 실행. `SOURCES` 배열의 각 소스를 순서대로 읽어 `public/data/facilities.json` 하나를 생성하고, 소스별 소계와 전체 합계를 리포트로 출력한다.

```ts
const SOURCES = [
  { key: "f", label: "경인지방병무청", file: "경인_…_정리.xlsx",     mapLinks: "naver-map-facility-links.json" },
  { key: "n", label: "경기북부지청",   file: "경기북부_…_정리.xlsx", mapLinks: "naver-map-facility-links.north.json" },
];
```

1. 모든 문자열 필드: 앞뒤 공백·탭 제거, 연속 공백 1개로 정리 — **단, 비고(note)는 trim만 적용하고 내부 공백·개행은 보존**하며, **감면 내용(benefitDescription)은 개행을 보존하고 줄 단위로만 공백을 정리**한다(`normalizeMultilineText`)
2. 빈 문자열과 `-` → null
3. 엑셀 오류 문자열(`#VALUE!`, `#REF!`, `#N/A`, `#DIV/0!`) → null
4. 주소의 따옴표류(`"`, `"`, `"`) 제거 (예: 연번 179 `거북섬서로 "35"`)
5. 홈페이지 URL: `^https?://` 형식 검증, `new URL()` 파싱 실패 시 null
6. 연락처 파싱: phoneDisplay = 원문 / phoneTel = ①숫자·하이픈 외 문자로 분리된 첫 번째 번호 채택 ②괄호 이하 제거 ③마침표 구분은 하이픈으로 정규화 ④전화 패턴(`^\d{2,4}-?\d{3,4}-?\d{4}$` 또는 대표번호 `^1\d{3}-?\d{4}$`) 불일치 시 phoneTel=null·phoneDisplay=null (예: "홈페이지 확인")
7. 주소는 추정·보완하지 않는다 — 시·군 단위만 있는 주소도 원문 유지
8. 필수값(지역·업종·시설명·우대 대상·감면 내용·면제/할인) 누락 → dataStatus="needs_review", isActive=false로 JSON에 포함하되 화면 제외
9. 중복 자동 병합 금지 — 지역+업종+시설명 동일 시 변환 스크립트가 경고만 출력. 판정은 **소스를 통합해서** 한다
10. 연번 중복 검사는 **소스 내부**에서만 한다 — 소스가 다르면 같은 연번이 정상적으로 존재한다
11. 검증 실패(미정의 지역값·업종값 발견) 시 변환을 **중단**하고 오류 목록 출력 — 조용한 fallback 금지. 오류·경고 메시지에는 `[소스키]` 접두어가 붙는다
12. 변환 리포트: 소스별 소계와 전체 합계로 총 건수·공개 건수·필드 보유 통계를 출력해 기준 수치와 대조

**기대 산출** (2026-08-02 기준): 총 491건 → published 489건(needs_review 2건: f-039·f-041), 광역(isProvincial) 4건. 소스별 소계는 경인 433건 / 경기북부 58건.

### 7.1 소스 추가 절차

핵심 코드를 바꾸지 않고 관할 기관을 늘릴 수 있다.

1. 정제 엑셀을 `data-source/`에 배치한다 (앞 12컬럼 이름·순서가 기존과 같아야 한다)
2. 지도 링크 JSON을 같은 폴더에 배치한다 (`{sourceRowNumber, url}` 필수, `placeId`·`lat`·`lng` 선택)
3. `SOURCES` 배열에 항목 1개를 추가한다 — `key`는 기존과 겹치지 않는 1글자
4. `SourceKey` 유니온 타입에 새 키를 추가한다
5. `npm run convert:data` → 리포트의 소스별 소계 확인 → `facilities.test.ts` 기대값 갱신

지역·업종 원문값이 기존 `sourceLabels`에 없으면 변환이 중단된다. 이때 **매핑을 임의로 추가하지 말고** 담당자와 원문 표기를 먼저 확인한다.

## 8. 상태 모델

| 상태 | 저장 위치 | 근거 |
|---|---|---|
| 현재 화면 | URL 경로 | 새로고침·공유·뒤로가기 복원 |
| 선택 지역 | URL `:regionCode` | 〃 |
| 선택 업종 | URL `:categoryCode` | 〃 |
| 선택 시설 | URL `:facilityId` | 〃 |
| 검색어 | FacilityListPage 로컬 state + sessionStorage(`list:{region}:{category}`) | 상세 복귀 시 복원, 새 세션 초기화 |
| 시설 목록 스크롤 위치 | sessionStorage(동일 키) | 〃 |
| 데이터 로딩 상태 | useFacilityData 훅 (모듈 캐시) | 앱 진입 시 1회 fetch, 실패 시 ErrorState |
| 외부 링크 오류 상태 | 호출 컴포넌트 로컬 state + LiveRegion | 실패해도 현재 화면 유지 |
| (후속) 모바일 지역 선택 방식 | 이번 단계 없음 — 지도 도입 시 로컬 state로 추가 | 지도 skip 확정 |

전역 상태 라이브러리는 사용하지 않는다. 시설 데이터는 fetch 후 모듈 수준 캐시로 유지한다.

## 9. 디자인 토큰

`globals.css`의 CSS 변수로 정의하고 Tailwind theme에서 참조한다(하드코딩 반복 금지).

```css
:root {
  --color-navy: #173B70;      /* 주요 버튼, 선택 상태, 아이콘 */
  --color-navy-deep: #10284D; /* 제목, 강조, 토스트 */
  --color-blue: #245FBA;      /* 링크, 보조 강조 */
  --color-blue-soft: #E8F0FB; /* 아이콘 배경, 선택 보조 */
  --color-gold: #C88C35;      /* 진행, 포커스 강조 — 작은 본문 글자 사용 금지 */
  --color-gold-soft: #F7EAD6; /* 준비 중 상태 */
  --color-paper: #F5F2EB;     /* 전체 배경 */
  --color-surface: #FFFEFA;   /* 콘텐츠 배경 */
  --color-ink: #14213A;       /* 본문 글자 */
  --color-muted: #626D7E;     /* 보조 글자 */
  --color-line: #D9D5CC;      /* 구분선 */
}
```

- 글꼴: Gmarket Sans 라이선스 확인 전까지 시스템 한글 산세리프 스택(`"Pretendard Variable" 미사용, system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`)을 `--font-sans` 토큰 1곳에 정의 — 라이선스 확정 시 이 변수만 교체.
- 여백: 0~380px → 15px / 381~680px → 18px / 681px~ → 28px. 최대 콘텐츠 폭 1180px.
- 터치 영역: 일반 44px, 주요 선택 버튼 48px(업종 버튼 모바일 64px 권장).
- 본문 기본 16px 이상. WCAG AA 대비 준수(gold는 보조 강조 전용).

## 10. 접근성 구조 (구현 수준)

| 항목 | 구현 |
|---|---|
| 문서 언어 | `index.html`에 `lang="ko"` |
| 본문 바로가기 | SkipLink가 첫 포커스 요소, `#main-content`로 이동 |
| 키보드 탐색 | 모든 선택 요소는 `button`/`a` 시맨틱. 시각 순서 = DOM 순서 = 포커스 순서 |
| 진행 표시 | ProgressIndicator에 시각 "1 / 3" + sr-only "3단계 중 1단계: 지역 선택" |
| 빈 업종 | `disabled` 버튼(포커스 제외) + 버튼 내부 "등록 시설 없음" 텍스트 |
| aria-live | LiveRegion(polite) 1개 상주 — 검색 결과 건수("총 n개 시설"), 외부 링크 실패 메시지 |
| 포커스 이동 | 라우트 전환 후 `useFocusOnNavigate`가 새 화면 h1(tabindex="-1")로 포커스 이동 |
| 포커스 표시 | `:focus-visible`에 3px gold 외곽선 + 2px offset (전역 스타일) |
| 터치 영역 | 44px/48px 최소 높이를 컴포넌트 기본 클래스로 강제 |
| 200% 확대 | 고정 높이 금지, rem 단위, 콘텐츠 겹침·가로 스크롤 없음 (E2E 검증) |
| prefers-reduced-motion | `@media (prefers-reduced-motion: reduce)`에서 화면 전환·순차 등장·토글 이동 제거 |
| 상세 정보 | dl/dt/dd 구조로 라벨-값 의미 연결 |
| 목록 | ul/li + 전체 행 링크, 화살표 아이콘에 aria-hidden(행 자체에 접근명) |
| 아이콘 버튼 | 검색 지우기 등 모든 아이콘 버튼에 aria-label |
| 상태 구분 | 색상 + 텍스트/외곽선 병행(선택·비활성·준비 중) |
| (후속) SVG 지도 포커스 | 지도 도입 시 각 path에 role="button"·tabindex·접근명 — 이번 단계 해당 없음 |

## 11. 외부 링크 처리 (services/externalLink.ts)

| 링크 | 구성 | 규칙 |
|---|---|---|
| 전화 | `tel:{phoneTel}` | phoneTel 있을 때만 버튼 렌더 |
| 홈페이지 | `<a href={homepageUrl} target="_blank" rel="noopener noreferrer">` | http/https만, 검증 실패 값은 데이터 단계에서 이미 null |
| 지도 | `https://map.naver.com/p/search/{encodeURIComponent(`${facilityName} ${address}`)}` | 주소 있을 때만. 공개 전 실기기 URL 형식 검증 항목 유지 |

- 세 값이 모두 없으면 FacilityActionButtons 영역 전체를 렌더하지 않고, 하단 안내를 "자세한 이용 방법은 해당 시·군청에 문의해 주세요."로 분기.
- 새 탭 열기 실패(팝업 차단 등) 시 현재 화면과 선택 상태 유지, LiveRegion으로 "페이지를 열지 못했어요" 안내.
- 내부 이동은 React Router `Link`, 외부 이동은 `a[target=_blank]`로 구분.

## 12. 테스트 전략

| 계층 | 도구 | 대상 |
|---|---|---|
| 단위 | Vitest | filterService(지역·업종·검색·경기도 공통 표출), externalLink(URL 생성·인코딩), 변환 규칙 함수(공백·null·URL·전화 파싱), regionConfig/categoryConfig 무결성(업종 정확히 7개) |
| 데이터 검증 | Vitest (변환 산출물 대상) | 440건 로드, published 438건, 비고 원문 일치(엑셀 대조 스냅샷), 필수값 누락 시설 미공개, 미정의 지역·업종 부재 |
| 컴포넌트 | RTL + vitest-axe | 각 페이지 렌더·조건부 노출(비고/버튼 숨김 8조합 매트릭스), 빈 업종 disabled, EmptyResult CTA, axe 위반 0 |
| E2E | Playwright | ①지역→업종→목록→상세→외부 버튼 전체 흐름 ②키보드 전용 동일 흐름 ③검색 입력·지우기·결과 없음 ④상세→뒤로가기 검색어·스크롤 복원 ⑤새로고침 상태 유지 ⑥390px 가로 넘침 없음·1440px 1180px 정렬 ⑦reduced-motion 애니메이션 제거 ⑧외부 링크 rel/target 속성 |
| 반응형 | Playwright 뷰포트 390/768/1440 | 레이아웃 열 수, 터치 영역 크기 |
| 접근성 수동 검수 | 체크리스트 | 스크린리더(모바일 TalkBack/VoiceOver 중 1), 200% 확대, 고대비 |

CI 기준: TypeScript 오류 0, 테스트 전체 통과, 빌드 성공이 완료 조건(출시 차단 조건과 연동).

## 13. 향후 확장 구조 (MVP 분리)

| 기능 | 준비된 접점 | 이번 단계 상태 |
|---|---|---|
| 경기도 지도 SVG 선택 | RegionSelectionPage에 지도/목록 영역 슬롯, regionCode ↔ SVG path id 매핑 테이블 자리(regionConfig) | **이번 단계 skip 확정** — 목록 단일 방식 |
| 가까운 군마트 찾기 | ComingSoonCard (비상호작용) | 준비 중 표시만 |
| 병역명문가 신청 연결 | ComingSoonCard (비상호작용) | 준비 중 표시만 |
| 관리자 엑셀 업로드 | convert-data.ts의 검증 로직을 서버 함수로 이전 가능하게 순수 함수로 작성 | 로컬 스크립트만 |
| 데이터베이스 | facilityRepository 인터페이스 뒤로 저장소 교체 가능 | 정적 JSON |
| 분석 이벤트 | PRD 14의 이벤트명 명세 보존, analytics 모듈 자리만 | 미구현 |
| 시설 사진 | Facility.imageUrl 필드·FacilityVisual 4:3 영역 이미 반영 | 항상 기본 아이콘 |
| 감면 내용 검색 | filterService 검색 대상 파라미터화 | 시설명만 활성 |
| 면제/할인 배지, 기관구분 노출 | 데이터 보존 완료, Badge 컴포넌트 재사용 | 미노출 |
