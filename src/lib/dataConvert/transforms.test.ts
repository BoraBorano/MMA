import {
  cleanAddress,
  normalizeNote,
  normalizeWhitespace,
  parsePhone,
  toNullable,
  validateHomepageUrl,
} from "@/lib/dataConvert/transforms";

describe("normalizeWhitespace", () => {
  it("앞뒤 공백·탭 제거, 연속 공백 정리", () => {
    expect(normalizeWhitespace("  경기도\t수원시   권선구 ")).toBe("경기도 수원시 권선구");
  });
});

describe("toNullable", () => {
  it.each(["", "-", " - ", "#VALUE!", "#REF!", "#N/A"])(
    "'%s'를 null로 변환한다",
    (value) => {
      expect(toNullable(value)).toBeNull();
    },
  );

  it("유효한 값은 유지한다", () => {
    expect(toNullable(" 지자체 ")).toBe("지자체");
  });
});

describe("normalizeNote (FR-015 비고 원문 유지)", () => {
  it("앞뒤 공백만 제거하고 내부 공백·개행은 보존한다", () => {
    expect(normalizeNote(" 조례 제11조\n별표9  기준 ")).toBe("조례 제11조\n별표9  기준");
  });

  it("빈 값과 대시는 null", () => {
    expect(normalizeNote("-")).toBeNull();
    expect(normalizeNote("  ")).toBeNull();
  });
});

describe("cleanAddress", () => {
  it("따옴표 오염을 제거한다 (실데이터 연번 179)", () => {
    expect(cleanAddress('경기 시흥시 거북섬서로 "35"')).toBe("경기 시흥시 거북섬서로 35");
  });

  it("엑셀 오류 문자열은 null (실데이터 구 #VALUE! 건)", () => {
    expect(cleanAddress("#VALUE!")).toBeNull();
  });

  it("주소를 추정·보완하지 않는다 — 시·군 단위 주소도 원문 유지", () => {
    expect(cleanAddress("경기도 김포시")).toBe("경기도 김포시");
  });
});

describe("validateHomepageUrl", () => {
  it("http/https만 허용한다", () => {
    expect(validateHomepageUrl("https://www.gcart.or.kr/Arts/main.do")).toBe(
      "https://www.gcart.or.kr/Arts/main.do",
    );
    expect(validateHomepageUrl("www.example.com")).toBeNull();
    expect(validateHomepageUrl("javascript:alert(1)")).toBeNull();
    expect(validateHomepageUrl("-")).toBeNull();
  });
});

describe("parsePhone (FR-017 파싱 규칙 — 실데이터 이상값 4건)", () => {
  it("일반 번호는 표시값·실행값 동일", () => {
    expect(parsePhone("02-507-4019")).toEqual({
      phoneDisplay: "02-507-4019",
      phoneTel: "02-507-4019",
    });
  });

  it("전화 패턴이 아닌 값은 모두 null (연번 16 '홈페이지 확인')", () => {
    expect(parsePhone("홈페이지 확인")).toEqual({ phoneDisplay: null, phoneTel: null });
  });

  it("마침표 구분을 하이픈으로 정규화 (연번 18)", () => {
    expect(parsePhone("031.270.8600").phoneTel).toBe("031-270-8600");
  });

  it("복수 번호는 첫 번째만 실행값으로 (연번 92)", () => {
    const parsed = parsePhone("1670-9751/031-307-1001");
    expect(parsed.phoneDisplay).toBe("1670-9751/031-307-1001");
    expect(parsed.phoneTel).toBe("1670-9751");
  });

  it("괄호 이하(내선)를 실행값에서 제거하고 표시값은 원문 유지 (연번 109)", () => {
    const parsed = parsePhone("031-238-9121(내선 100)");
    expect(parsed.phoneDisplay).toBe("031-238-9121(내선 100)");
    expect(parsed.phoneTel).toBe("031-238-9121");
  });

  it("빈 값은 모두 null", () => {
    expect(parsePhone("-")).toEqual({ phoneDisplay: null, phoneTel: null });
  });
});
