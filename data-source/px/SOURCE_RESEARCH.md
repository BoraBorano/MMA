# PX 데이터 출처 조사 보고

## 결론

서비스의 매장명·주소·운영시간·점심시간·비고·전화번호는 국방부 국군복지단 공식 데이터만 기준으로 했다. 공식 원본은 2026-04-28 기준 전국 120개 영외마트를 담고 있으며, 주소 기준으로 경기도 49개를 확인했다.

공식 원본에는 좌표가 없다. 따라서 좌표는 다른 공개 정리 자료에서 후보를 취한 뒤, 공식 원본의 매장명·주소·전화번호와 교차 대조했다. 좌표는 도식 지도의 표시에만 사용하고 공식 좌표라고 표현하지 않는다.

## 조사 방법

`scrapling-source-research` 스킬의 원칙에 따라 로그인·캡차·보호 우회 없이 공개 페이지 3개만 낮은 요청량으로 확인했다.

```powershell
python C:\Users\letgo\.codex\skills\scrapling-source-research\scripts\scrapling_source_pack.py `
  https://www.data.go.kr/data/15126305/fileData.do `
  https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9645 `
  https://mpva.go.kr/mpva/selectBbsNttView.do?bbsNo=33&key=146&nttNo=250324&pageIndex=1&searchCnd=SJ&searchKrwd=%EB%A7%88%ED%8A%B8 `
  -o handoff\px-feature\source-pack.md
```

세 요청 모두 HTTP 200을 확인했다. 일부 국내 공공사이트의 응답 인코딩과 추출기 기본값이 달라 `source-pack.md`의 한글이 깨진 부분은 이 문서와 공식 페이지를 기준으로 재검토했다.

## 출처별 판정

### 1. 공공데이터포털

- URL: https://www.data.go.kr/data/15126305/fileData.do
- 제공 기관: 국방부
- 데이터명: 국방부 국군복지단 영외마트 운영 현황
- 기준일: 2026-04-28
- 확인한 역할: 데이터셋 메타데이터와 공식 제공자 확인
- 판정: 최우선 공식 출처

### 2. 국방부 공공데이터 개방 시트

- URL: https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9645
- 원본 그리드 응답: https://opendata.mnd.go.kr/openinf/sheetexec.jsp?onepagerow=200&infId=OA-9645&dsId=TB_MND_MART_CURRENT&strWhere=&filterCol=&txtFilter=&ibpage=1
- 확인한 행 수: `TOTAL: 120`, `DATA.length: 120`
- 사용 필드: `MART`, `LOC`, `OP_WEEKDAY`, `OP_SAT`, `OP_SUN`, `LUNCH_WEEKDAY`, `LUNCH_SAT`, `LUNCH_SUN`, `NOTE`, `TEL`
- 판정: 화면 표시용 운영 정보의 공식 원본

### 3. 국가보훈부 이용 안내

- URL: https://mpva.go.kr/mpva/selectBbsNttView.do?bbsNo=33&key=146&nttNo=250324&pageIndex=1&searchCnd=SJ&searchKrwd=%EB%A7%88%ED%8A%B8
- 확인한 역할: 국가유공자·유족 등의 영외마트 이용 안내와 국군복지포털 연결 근거 확인
- 판정: 이용 자격을 앱에서 단정적으로 확정하지 않고 공식 포털 재확인을 유도할 근거

### 4. 2차 좌표 후보 자료

- URL: https://gunmart-site.vercel.app/gunmart
- 확인한 역할: 좌표 후보 확보
- 사용 방법: 공식 원본과 매장명·주소·전화번호를 대조한 경우만 `lat`, `lng`를 채택
- 제외한 필드: 2차 자료의 영업시간, 휴무, 비고
- 판정: 비공식 보조 출처. 정밀 위치 증명이 아닌 도식 지도 표시에만 사용

## 정제·매핑 규칙

1. 주소가 `경기도`, `경기`, `양주시`, `파주시`로 시작하는 공식 행만 경기도 대상으로 분류했다.
2. `(영외)` 표기를 제거한 이름으로 1차 대조했다.
3. 이름이 같은 후보의 정규화 주소를 비교했다.
4. 주소 표기가 바뀐 1개 `전승`은 전화번호 일치로 재확인했다.
5. 좌표를 EPSG:5179로 투영한 뒤 800×944 SVG 좌표로 변환했다.
6. 좌표 근사치로 시군 경계 밖에 놓인 `올림픽` 1개는 정밀 길찾기가 아닌 지역 도식 지도라는 목적에 맞게 양주 시군 내부 라벨 좌표로만 표시를 조정했다. 원본 `lat`, `lng`는 바꾸지 않았다.
7. 네이버지도 검색 결과를 상호·지역·전화번호와 대조해 49개 매장의 장소 ID 직접 링크를 검증했으며, 근거는 `naver-map-links.json`에 보존했다.

## 검증 결과

- JSON 매장 수: 49
- CSV 데이터 행: 49
- 중복 ID: 0
- 필수 공식 필드 누락: 0
- 좌표 대조 누락: 0
- SVG 범위 이탈: 0
- HTTPS가 아닌 외부 링크: 0

자동 검증 상세는 `data-quality-report.json`에 남겼다.
