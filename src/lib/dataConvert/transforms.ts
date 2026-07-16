/**
 * 엑셀 → 앱 데이터 변환 규칙 (ARCHITECTURE §7).
 * 순수 함수만 두어 변환 스크립트와 테스트가 공유한다.
 */

const EXCEL_ERROR_VALUES = ["#VALUE!", "#REF!", "#N/A", "#DIV/0!", "#NAME?", "#NULL!"];

/** 앞뒤 공백·탭 제거, 연속 공백 정리. 비고에는 사용하지 않는다. */
export function normalizeWhitespace(value: string): string {
  return value.replace(/\t/g, " ").replace(/ {2,}/g, " ").trim();
}

/** 빈 문자열, "-", 엑셀 오류 문자열을 null로 변환 (PRD 10.5 + v1.1 보강) */
export function toNullable(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-" || EXCEL_ERROR_VALUES.includes(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * 비고는 원문 유지가 원칙 (FR-015). 앞뒤 공백 제거만 적용하고
 * 내부 공백·개행은 보존한다.
 */
export function normalizeNote(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-") {
    return null;
  }
  return trimmed;
}

/** 주소: null 변환 + 따옴표 오염 제거 + 공백 정리. 값을 추정·보완하지 않는다. */
export function cleanAddress(value: string): string | null {
  const nullable = toNullable(value);
  if (nullable === null) {
    return null;
  }
  const cleaned = normalizeWhitespace(nullable.replace(/["“”'']/g, ""));
  return cleaned === "" ? null : cleaned;
}

/** 홈페이지 URL: http/https 형식 검증 후 유효할 때만 공개 (PRD 10.5) */
export function validateHomepageUrl(value: string): string | null {
  const nullable = toNullable(value);
  if (nullable === null) {
    return null;
  }
  const candidate = normalizeWhitespace(nullable);
  if (!/^https?:\/\//i.test(candidate)) {
    return null;
  }
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return null;
  }
}

export interface ParsedPhone {
  phoneDisplay: string | null;
  phoneTel: string | null;
}

const PHONE_PATTERN = /^(\d{2,4}-\d{3,4}-\d{4}|1\d{3}-\d{4}|\d{8,11})$/;

/**
 * 연락처 표시값·실행값 분리 (FR-017 v1.1 파싱 규칙).
 * ① 괄호 이하(내선 등) 제거 ② 복수 번호는 첫 번째만 ③ 마침표 구분을 하이픈으로
 * ④ 전화 패턴이 아니면(예: "홈페이지 확인") 표시값·실행값 모두 null.
 */
export function parsePhone(value: string): ParsedPhone {
  const nullable = toNullable(value);
  if (nullable === null) {
    return { phoneDisplay: null, phoneTel: null };
  }
  const display = normalizeWhitespace(nullable);

  let candidate = display;
  const parenIndex = candidate.indexOf("(");
  if (parenIndex >= 0) {
    candidate = candidate.slice(0, parenIndex);
  }
  const first = candidate.split(/[/,]/)[0] ?? "";
  const tel = first.replace(/\./g, "-").replace(/\s+/g, "");

  if (!PHONE_PATTERN.test(tel)) {
    return { phoneDisplay: null, phoneTel: null };
  }
  return { phoneDisplay: display, phoneTel: tel };
}
