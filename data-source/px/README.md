# 경기도 PX 기능 전달 패키지

기존 예우시설 웹앱에 `경기도 군마트 찾기` 기능을 붙일 때 사용하는 Claude Code 프롬프트와 정제 데이터다.

## 가장 빠른 사용법

1. 이 `handoff/px-feature` 폴더를 개발 중인 프로젝트에 그대로 둔다.
2. [`CLAUDE_PX_IMPLEMENTATION_PROMPT.md`](./CLAUDE_PX_IMPLEMENTATION_PROMPT.md)의 본문을 Claude Code에 통째로 붙여 넣는다.
3. Claude가 구현 후 보고한 lint·test·build 결과와 모바일 화면을 확인한다.

## 파일 구성

- `CLAUDE_PX_IMPLEMENTATION_PROMPT.md`: 기존 개발분을 보존하면서 PX 기능을 붙이는 원샷 구현 프롬프트
- `px-stores-gyeonggi.json`: 앱에 바로 넣을 수 있는 경기도 PX 데이터
- `px-stores-gyeonggi.csv`: 사람이 Excel에서 검토하기 쉬운 UTF-8 BOM CSV
- `gyeonggi-map.json`: 고정형 경기도 SVG 도식 지도
- `data-quality-report.json`: 행 수·필수값·링크·좌표 검증 결과
- `SOURCE_RESEARCH.md`: 공식·2차 출처의 역할과 정제·검증 방법을 정리한 사람용 보고서
- `source-pack.md`: Scrapling으로 보수적으로 수집한 공식 출처 검토 기록
- `scripts/prepare-px-data.mjs`: 공식 원본을 필터링·표준화하고 좌표 후보를 교차 대조하는 재생성 스크립트
- `source/`: 재생성에 사용한 원본 스냅샷과 경계 데이터

## 확인된 데이터 범위

- 국방부 공식 전국 영외마트: 120개
- 그중 주소가 경기도인 매장: 49개
- 공식 기준일: 2026-04-28
- 공식 필드: 매장명, 주소, 평일·토요일·일요일 운영시간, 점심시간, 비고, 전화번호
- 좌표 후보 대조: 49개 중 49개
  - 이름과 주소 일치: 48개
  - 이름과 전화번호 일치: 1개 `전승`
- SVG 범위 이탈: 0개
- 좌표 누락: 0개

경기도 평택의 `평택 쇼핑타운`은 국방부 공식 `영외마트 운영 현황` 120개 행에 포함되지 않아 본 서비스 데이터에 임의로 합치지 않았다. 영외마트와 쇼핑타운을 함께 안내하려면 별도의 공식 쇼핑타운 데이터로 검증한 후 `type` 구분을 두고 추가해야 한다.

## 핵심 필드

`px-stores-gyeonggi.json`은 `metadata` 객체와 `stores` 배열로 구성된다.

| 필드 | 용도 | 신뢰 기준 |
| --- | --- | --- |
| `name`, `officialName` | 화면 표시와 공식 명칭 보존 | 국방부 공식 |
| `region`, `address` | 지역 필터와 주소 | 국방부 공식 |
| `hours`, `lunchHours` | 영업·점심시간 | 국방부 공식 |
| `note`, `phone` | 운영 주의사항과 문의 | 국방부 공식 |
| `lat`, `lng` | 표시용 위치 후보 | 2차 공개 자료를 공식 이름·주소·전화번호와 대조 |
| `svgX`, `svgY` | 800×944 SVG 지도 마커 위치 | 좌표 후보를 EPSG:5179로 변환해 표시용으로 산출 |
| `naverMapUrl` | 네이버지도 외부 연결 | 검증된 장소 ID 직접 링크 |
| `welfarePortalUrl` | 국군복지포털 외부 연결 | 공식 포털 홈 |

## 출처

- [공공데이터포털 국방부 국군복지단 영외마트 운영 현황](https://www.data.go.kr/data/15126305/fileData.do)
- [국방부 공공데이터 개방 원본 시트](https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9645)
- [국가보훈부 국군복지단 영외마트 이용 안내](https://mpva.go.kr/mpva/selectBbsNttView.do?bbsNo=33&key=146&nttNo=250324&pageIndex=1&searchCnd=SJ&searchKrwd=%EB%A7%88%ED%8A%B8)
- [좌표 대조에만 사용한 2차 공개 자료](https://gunmart-site.vercel.app/gunmart)
- [국군복지포털](https://www.welfare.mil.kr)

주소·운영시간·전화번호는 국방부 원본을 우선했다. 2차 자료의 영업시간과 비고는 표시 데이터에 합치지 않았다.

## 중요한 제약

1. **좌표는 공식 필드가 아니다.**
   국방부 원본은 좌표를 제공하지 않는다. 따라서 좌표는 도식 지도의 직관적인 매핑에만 쓰고, 정밀 길찾기나 거리 계산에 쓰면 안 된다.
2. **네이버 링크는 검증된 장소 고정 링크다.**
   상호·지역·전화번호 또는 검색 결과를 대조한 장소 ID를 사용하며, 검증 근거는 `naver-map-links.json`에 보존한다.
3. **운영시간은 바뀐 수 있다.**
   재물조사, 임시휴점, 신분별 분리 운영이 있으므로 방문 전 매장 전화 또는 국군복지포털에서 재확인해야 한다.
4. **라이선스 표시를 보수적으로 하라.**
   공공데이터포털과 국방부 시트의 표시가 다르므로, 서비스에 상기 공식 출처를 표시하고 이 필터링 파일을 `국방부 공식 원본`이라고 표현하지 만다. 외부 상용 배포 전에는 사용 범위를 다시 확인하는 것이 안전하다.

## 데이터 재생성

원본 스냅샷을 바꾼 후 다음을 실행하면 JSON·CSV·검증 보고서·포터블 지도 데이터가 재생성된다.

```bash
node handoff/px-feature/scripts/prepare-px-data.mjs
```
