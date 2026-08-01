# 인계 문서 — 경기북부 예우시설 데이터 추가

> Cowork 세션(2026-08-01) → Claude Code / CLI 인계용.
> 실행 환경(리눅스 샌드박스) 기동 실패로 파일 조작·git 실행을 못 해 계획 수립까지만 완료했습니다.
> **상세 계획은 [docs/GYEONGGI_NORTH_DATA_PLAN.md](./docs/GYEONGGI_NORTH_DATA_PLAN.md)를 먼저 읽으세요.** 이 문서는 그 계획을 실행하기 위한 상태·함정 인계서입니다.

---

## 0. 한 줄 요약

경기북부지청 관할 예우시설 **58건**을 기존 433건에 추가한다. 지역·업종 매핑은 전부 기존 설정과 일치하므로 **`regionConfig.ts` / `categoryConfig.ts`는 손대지 않는다.** 변환 파이프라인을 단일 소스 → 다중 소스 구조로 바꾸는 것이 작업의 핵심이다.

---

## 1. 현재 상태

| 항목 | 상태 |
|---|---|
| 계획서 `docs/GYEONGGI_NORTH_DATA_PLAN.md` | **master 머지 완료** (`5b990b7`, PR merged) |
| 로컬 `.gitignore`에 `~$*` 추가 | **커밋 안 됨** — working tree에 수정 상태로 남아 있음 |
| `data-source/` 북부 엑셀 배치 | 미완 (§3 참조) |
| `naver-map-facility-links.north.json` 생성 | 미완 |
| 변환 스크립트·타입·화면·테스트 수정 | 전부 미착수 |
| 현재 브랜치 | `master` (머지 후 `git pull` 필요할 수 있음) |

### 첫 작업

```
git switch master
git pull
git switch -c feat/add-gyeonggi-north-data
git add .gitignore
git commit -m "chore: 오피스 임시 잠금 파일(~$*) gitignore 추가"
```

---

## 2. 확정 결정 (담당자 승인 완료 — 재확인 불필요)

| # | 결정 |
|---|---|
| ID 체계 | 소스 접두어 분리. 남부 `f-{연번3자리}` 유지, 북부 `n-001`~`n-058`. **연번 재부여·오프셋 금지** |
| 소스 라벨 | `key: "n"`, `label: "경기북부지청"` (경인청 관할 지청. "경기북부지방병무청" 아님) |
| D1 | 폐관 시설(메가박스 양주) 제외 확정 → 58건 |
| D2 | 소노휴 양평 홈페이지 URL 스킴 부여 완료 |
| D3 | 경기북부간호학원 = 이전 확인됨, 주소 수정 완료 → 네이버 링크 채택 |
| D4 | 시설명 괄호 누락 2건 수정 완료 |
| D5 | **데이터 기준일 `2026-04-30` 단일 유지.** 소스별 기준일 분기 불필요, 푸터 변경 없음 |
| D6 | 감면 내용 개행 **보존** (구현 상세는 계획서 §4) |
| D7 | 비고 열 라벨 그대로 "비고" |
| D8 | 좌표·place_id **스키마에 보존**, MVP 화면 미사용 |
| D9 | 출처 기관 데이터만 보존, 화면 미노출 |
| D10 | 남부 지도 링크 품질 보강은 **이번 범위 제외**, 후속 과제 |

---

## 3. 원본 데이터 — 위치와 함정

### 3.1 파일 위치

`C:\Users\infac\OneDrive\Desktop\Data\` (저장소 밖. `data-source/`로 옮겨야 함)

| 파일 | 건수 | 용도 |
|---|---:|---|
| `병역명문가_예우시설_통합(원본+네이버링크).xlsx` | 58 | ⭐ **유일 소스로 사용** |
| `경기북부_병역명문가 예우.xlsx` | 58 | 원본 (통합본에 포함됨) |
| `병역명문가_네이버지도_링크.xlsx` | 59 | ⚠️ **참조 금지** |

### 3.2 ⚠️ 함정 1 — 파일 간 연번이 어긋난다

`병역명문가_네이버지도_링크.xlsx`는 폐관 시설(메가박스 양주)을 **포함해 59건**이고, 통합본은 이를 **제외해 58건**이다. 그 결과 **연번 5번 이후로 1씩 밀려 있다.**

```
링크파일 연번 5 = 메가박스(양주, 폐관)      → 통합본에 없음
링크파일 연번 6 = 부광스포렉스사우나        = 통합본 연번 5
링크파일 연번 59 = 자향한방병원             = 통합본 연번 58
```

통합 파일에는 원본 12컬럼과 네이버 링크가 **이미 정합하게 병합**되어 있다. 링크 파일을 따로 조인하면 전 건이 어긋나므로 절대 참조하지 말 것.

### 3.3 ⚠️ 함정 2 — CSV 인코딩

같은 폴더에 `.csv` 사본이 있으나 **`경기북부_...csv`와 `통합...csv`는 CP949**로 저장되어 UTF-8로 읽으면 한글이 깨진다(`병역명문가_네이버지도_링크.csv`만 UTF-8). **xlsx를 exceljs로 직접 읽을 것.** `exceljs`는 이미 devDependency에 있다.

### 3.4 통합 파일 컬럼 구조 (21열)

1~12열은 기존 스키마와 **순서까지 완전 일치** → `convert-data.ts`의 `COLUMNS` 상수 그대로 재사용 가능.

```
 1 연번          7 면제/할인      13 네이버_장소명
 2 지역          8 기관구분       14 네이버_도로명주소
 3 업종          9 비고(협약)     15 네이버지도_링크   ← url
 4 시설명       10 홈페이지 URL   16 place_id
 5 우대 대상    11 주소           17 위도             ← lat
 6 감면 내용    12 연락처         18 경도             ← lng
                                  19 주소일치
                                  20 신뢰도
                                  21 검토사항
```

> 9열 헤더가 `비고(협약)`이다. 남부는 조례 근거, 북부는 협약기간이 들어 있으나 D7에 따라 동일하게 "비고"로 표시한다.

### 3.5 `naver-map-facility-links.north.json` 생성 규격

통합 파일 13~18열에서 추출한다. 58건 전부 `/entry/place/` 정밀 링크이며 좌표·place_id를 보유한다.

```jsonc
[
  {
    "sourceRowNumber": 1,
    "url": "https://map.naver.com/p/entry/place/12182060",
    "placeId": "12182060",
    "lat": 37.7485644,
    "lng": 127.1750712
  }
]
```

남부 파일(`{sourceRowNumber, url}`)은 그대로 두고, 확장 필드는 **선택 필드**로 읽어 없으면 `null`을 부여한다. 남부 파일을 수정할 필요는 없다.

---

## 4. 사전 점검 결과 (재검증 불필요, 참고용)

### 통과 — 변환 중단 요인 없음

**지역값 10종 전부 `regionConfig.sourceLabels`에 존재** (축약형 일치)

의정부 25 · 양평 6 · 고양 6 · 남양주 5 · 파주 5 · 구리 4 · 포천 3 · 양주 2 · 가평 1 · 연천 1
동두천 0건 / **광역("경기도") 값 없음** → `isProvincial` 신규 발생 없음

**업종 6종 전부 `categoryConfig.sourceLabels`에 존재** (`숙박·관광` 가운뎃점 표기 확인)

의료 30 · 숙박·관광 12 · 문화 9 · 교육 3 · 기타 2 · 체육 2 · 주차 0

**연번** 1~58 순차, 결번·중복 없음 / **주소** 58건 전부 보유

### 개별 특이 건

| 대상 | 내용 |
|---|---|
| 연번 29 휘트니스H | 연락처 없음 → 전화 버튼 미노출 (정상) |
| 연번 56 새빛안과병원 | 감면 내용이 3줄 구성 → D6 개행 보존 대상. **검수 시 이 건으로 확인** |
| 연번 2·3·11·12·16·22·32 | 비고 보유 7건 (나머지 51건 없음) |
| 연번 3 소노휴 양평 | 58건 중 유일한 홈페이지 URL |

---

## 5. 코드 변경 지점 (이 세션에서 확인한 사실)

재탐색 시간을 아끼기 위해 확인된 내용을 적어둔다.

| 파일 | 현재 상태 | 필요 작업 |
|---|---|---|
| `scripts/convert-data.ts` | `SOURCE_FILE` 단일 상수, `DATA_UPDATED_AT` 단일 상수, `COLUMNS` 열번호 매핑, 소스 루프 없음 | `SOURCES` 배열 도입, 소스 루프화, `facilityId` 접두어, `sourceKey` 부여, 지도링크 소스별 로딩 |
| `src/lib/dataConvert/transforms.ts` | `normalizeWhitespace` / `toNullable` / `normalizeNote` / `cleanAddress` / `validateHomepageUrl` / `parsePhone` | `normalizeMultilineText` 신규 추가 (계획서 §4에 구현안 있음) |
| `src/components/facility/FacilityDescriptionList.tsx` | 비고 `dd`에만 `whitespace-pre-line` 있음. **감면 내용에는 없음** | 감면 내용 `dd`에 `whitespace-pre-line` 추가 |
| `src/components/facility/FacilityList.tsx` | `line-clamp-3`, `whitespace-pre-line` 없음 | **변경 없음** — 목록에서는 개행이 공백으로 렌더되는 게 의도된 동작 |
| `src/data/regionConfig.ts` | 경기 31개 시·군 전부 등록, 전부 `isPublished: true` | **변경 없음.** 단 `Region.provinceCode` 필드 추가(전부 `"gyeonggi"`) |
| `src/data/categoryConfig.ts` | 7개 고정, `숙박·관광` 가운뎃점 | **변경 없음** |
| `src/types/index.ts` | `Facility`에 좌표·소스 필드 없음 | `sourceKey`, `lat`, `lng`, `naverPlaceId` 추가 |
| `src/data/facilities.test.ts` | 건수·필드 통계 **전부 하드코딩** | §6 수치로 전면 갱신 |

### ⚠️ D6은 남부 데이터에도 영향을 준다

`benefitDescription`은 현재 `normalizeWhitespace`를 거쳐 개행이 소실된 상태다. `normalizeMultilineText`로 바꾸면 **남부 433건 중 개행이 있던 건도 함께 되살아난다.**

→ 변환 후 `public/data/facilities.json`의 **diff로 남부 영향 건수를 반드시 확인**할 것. 예상 밖으로 크면 D6을 북부 소스에만 한정 적용하는 방안으로 후퇴한다(담당자 확인 필요).

---

## 6. 검증 기준 수치

`facilities.test.ts` 갱신값. **변환 리포트 출력과 대조한 뒤 확정할 것** — 정제 과정에서 달라졌을 수 있다.

| 지표 | 현행 | 북부 | 병합 후 |
|---|---:|---:|---:|
| 총 시설 | 433 | 58 | **491** |
| 공개(published) | 431 | 58 | **489** |
| needs_review | 2 | 0 | **2** |
| 광역(경기도) | 4 | 0 | **4** |
| 홈페이지 URL | 85 | 1 | **86** |
| 주소 | 253 | 58 | **311** |
| 전화 실행 가능 | 86 | 57 | **143** |
| 비고 | 369 | 7 | **376** |
| 지도 링크 | 252 | 58 | **310** |
| 그중 `/entry/place/` | 54 | 58 | **112** |

신규 검증 항목: 소스별 소계, `sourceKey` 값 유효성, 좌표 보유 건수(북부 58 / 남부 0), `normalizeMultilineText` 단위 테스트.

---

## 7. 반드시 지킬 설계 원칙

프로젝트 전반의 불변 규칙이다. 편의를 위해 어기지 말 것.

- **미정의 지역값·업종값 발견 시 변환 중단.** 조용한 보정·fallback 금지
- **중복 자동 병합 금지** — 지역+업종+시설명 동일 시 경고만 출력
- **비고는 원문 그대로.** 요약·해석·가공 금지
- **주소·연락처 추정·보완 금지**
- 필수값 누락 → `dataStatus: "needs_review"`, `isActive: false` (JSON에는 포함, 화면 제외)
- 가상 시설·예시 데이터 금지 (테스트가 `DEMO`·`예시` 문자열 부재를 검증함)

---

## 8. 환경 관련 인계 사항

### git

- **`D:\MMA`에 소유권 경고가 있었다.** 해결됨 (`git config --global --add safe.directory D:/MMA`). 다른 PC에서 클론하면 재발 가능
- **작업 전 `git branch`로 현재 브랜치를 반드시 확인할 것.** 이번 세션에서 `master`인 줄 알고 작업하다 `fix/qa-20260718`에 커밋된 일이 있었다
- 로컬 `master`가 원격보다 뒤처지기 쉽다 (GitHub 웹에서 PR을 머지하면 로컬은 갱신되지 않음). **새 브랜치 생성 전 `git switch master && git pull`**
- PowerShell에서 여러 줄 커밋 메시지는 따옴표가 끊겨 `>>` 프롬프트에 갇힌다. `-m`을 여러 번 쓸 것
- 커밋 메시지는 BUG ID·결정사항을 담아 서술형으로 (git 히스토리에서 복구 가능해야 함 — 과거 QA 문서 유실 경험)

### 기타

- 엑셀을 열어둔 채 작업하면 `data-source/~$*.xlsx` 잠금 파일이 생긴다. `.gitignore`에 `~$*`를 추가해뒀으나 **아직 커밋 안 됨**
- GitHub 웹 UI에서 브라우저 자동 번역이 켜져 있으면 머지 버튼 상태 갱신이 멈추는 일이 있다. 새로고침 또는 번역 해제

---

## 9. 권장 작업 순서

1. `.gitignore` 커밋 + `feat/add-gyeonggi-north-data` 브랜치 생성
2. 통합 엑셀을 `data-source/경기북부_예우시설_2026_4_30_정리.xlsx`로 배치
3. 통합 엑셀 13~18열 → `data-source/naver-map-facility-links.north.json` 추출 (§3.5)
4. `transforms.ts`에 `normalizeMultilineText` 추가 + 단위 테스트
5. `convert-data.ts` 다중 소스 구조로 확장
6. 타입 확장 (`sourceKey` / 좌표 / `provinceCode`)
7. `npm run convert:data` → **출력 리포트를 §6과 대조**, 경고 목록 확인
8. `facilities.json` diff 검토 (남부 감면 내용 영향 — §5 경고)
9. `FacilityDescriptionList` 화면 반영
10. `facilities.test.ts` 갱신 → `npm test`
11. `npm run test:e2e` (390/768/1440) → `npm run build`
12. 표본 검수: 북부 5건 + 연번 56(개행) + 연번 3(홈페이지 버튼) + 연번 29(전화 버튼 미노출)
13. PR → 머지 → Cloudflare Pages 배포 확인
14. 변환 리포트 결과를 `docs/`에 기록

> QA 단계에 들어가면 `mma-qa` 스킬과 `QA_CHECKLIST.md` 체계를 사용한다(페이즈 단위 세션 구조).

---

## 10. 참고 문서

- [docs/GYEONGGI_NORTH_DATA_PLAN.md](./docs/GYEONGGI_NORTH_DATA_PLAN.md) — 본 작업 상세 계획 (필독)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) §6 스키마 / §7 변환 규칙
- [docs/RELEASE_CHECKLIST.md](./docs/RELEASE_CHECKLIST.md) — 출시 전 검수
- [README.md](./README.md) — 데이터 갱신 절차
