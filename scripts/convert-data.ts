/**
 * 정제 엑셀 → public/data/facilities.json 변환 (ARCHITECTURE §7).
 *
 * 실행: npm run convert:data
 * 검증 실패(미정의 지역·업종, 연번 중복 등) 시 변환을 중단한다 — 조용한 보정 금지.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import {
  findCategoryBySourceLabel,
} from "../src/data/categoryConfig";
import {
  PROVINCIAL_DISPLAY_LABEL,
  PROVINCIAL_SOURCE_LABEL,
  findRegionBySourceLabel,
  findRegionCodeInAddress,
} from "../src/data/regionConfig";
import {
  cleanAddress,
  normalizeMultilineText,
  normalizeNote,
  normalizeWhitespace,
  parsePhone,
  toNullable,
  validateHomepageUrl,
} from "../src/lib/dataConvert/transforms";
import type { Facility, FacilityDataset, SourceKey } from "../src/types";

const DATA_SOURCE_DIR = path.resolve(import.meta.dirname, "../data-source");
const OUTPUT_FILE = path.resolve(import.meta.dirname, "../public/data/facilities.json");

/** 두 소스 모두 같은 조사일자 기준이다 (GYEONGGI_NORTH_DATA_PLAN D5) */
const DATA_UPDATED_AT = "2026-04-30";

interface SourceDefinition {
  key: SourceKey;
  /** 관할 기관 — 데이터에만 보존하고 화면에는 노출하지 않는다 (D9) */
  label: string;
  file: string;
  mapLinks: string;
}

/**
 * 관할 기관별 원본. 항목을 추가하면 타 지청·타 청 데이터도 그대로 수용한다.
 * facilityId는 `${key}-${연번 3자리}` — 소스별로 연번을 원본 그대로 유지한다.
 */
const SOURCES: SourceDefinition[] = [
  {
    key: "f",
    label: "경인지방병무청",
    file: "경인_예우시설_2026_4_30_업데이트_정리.xlsx",
    mapLinks: "naver-map-facility-links.json",
  },
  {
    key: "n",
    label: "경기북부지청",
    file: "경기북부_예우시설_2026_4_30_정리.xlsx",
    mapLinks: "naver-map-facility-links.north.json",
  },
];

const COLUMNS = {
  rowNumber: 1,
  region: 2,
  category: 3,
  name: 4,
  target: 5,
  benefit: 6,
  benefitType: 7,
  organization: 8,
  note: 9,
  url: 10,
  address: 11,
  phone: 12,
} as const;

function cellText(row: ExcelJS.Row, column: number): string {
  const cell = row.getCell(column);
  const value = cell.value;
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    // 하이퍼링크 셀
    if ("hyperlink" in value && typeof value.hyperlink === "string") {
      const text = "text" in value ? String(value.text ?? "") : "";
      return text.trim() !== "" ? text : value.hyperlink;
    }
    // 서식 있는 텍스트 셀
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("");
    }
    return cell.text;
  }
  return String(value);
}

/**
 * 지도 링크 항목. placeId·lat·lng는 수집한 소스만 보유하는 선택 필드로,
 * 없으면 null을 부여한다 (남부 파일은 손대지 않는다 — D8).
 */
interface MapLinkEntry {
  sourceRowNumber: number;
  url: string | null;
  placeId?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface SourceResult {
  facilities: Facility[];
  errors: string[];
  warnings: string[];
}

async function convertSource(
  source: SourceDefinition,
  /** 시설 중복 경고는 소스를 통합해 판정한다 */
  duplicateKeys: Map<string, string[]>,
): Promise<SourceResult> {
  const mapLinks = JSON.parse(
    await readFile(path.join(DATA_SOURCE_DIR, source.mapLinks), "utf8"),
  ) as MapLinkEntry[];
  const mapLinkByRow = new Map(mapLinks.map((link) => [link.sourceRowNumber, link]));

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(DATA_SOURCE_DIR, source.file));
  const sheet = workbook.worksheets[0];
  if (sheet === undefined) {
    throw new Error(`[${source.key}] 워크시트를 찾을 수 없습니다 — ${source.file}`);
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const facilities: Facility[] = [];
  /** 연번 중복 검사는 소스 내부에서만 판정한다 */
  const seenRowNumbers = new Set<number>();

  sheet.eachRow((row, excelRowIndex) => {
    if (excelRowIndex === 1) {
      return; // 헤더
    }

    const rowNumber = Number(normalizeWhitespace(cellText(row, COLUMNS.rowNumber)));
    if (!Number.isInteger(rowNumber) || rowNumber <= 0) {
      errors.push(`[${source.key}] 엑셀 ${excelRowIndex}행: 연번이 유효하지 않습니다`);
      return;
    }
    if (seenRowNumbers.has(rowNumber)) {
      errors.push(`[${source.key}] 연번 ${rowNumber}: 중복된 연번`);
      return;
    }
    seenRowNumbers.add(rowNumber);
    const facilityId = `${source.key}-${String(rowNumber).padStart(3, "0")}`;

    const sourceRegion = normalizeWhitespace(cellText(row, COLUMNS.region));
    const categorySource = normalizeWhitespace(cellText(row, COLUMNS.category));
    const facilityName = normalizeWhitespace(cellText(row, COLUMNS.name));
    const benefitTarget = normalizeWhitespace(cellText(row, COLUMNS.target));
    // 감면 내용은 줄 구조가 의미를 가져 개행을 보존한다 (D6)
    const benefitDescription = normalizeMultilineText(cellText(row, COLUMNS.benefit));
    const benefitTypeRaw = normalizeWhitespace(cellText(row, COLUMNS.benefitType));
    const organizationType = toNullable(cellText(row, COLUMNS.organization));
    const note = normalizeNote(cellText(row, COLUMNS.note));
    const homepageUrl = validateHomepageUrl(cellText(row, COLUMNS.url));
    const address = cleanAddress(cellText(row, COLUMNS.address));
    const { phoneDisplay, phoneTel } = parsePhone(cellText(row, COLUMNS.phone));

    // 지역 매핑 — 미정의 값은 오류(조용한 보정 금지)
    const isProvincial = sourceRegion === PROVINCIAL_SOURCE_LABEL;
    let displayRegionCode: Facility["displayRegionCode"] = null;
    let displayRegionLabel = "";
    if (isProvincial) {
      displayRegionCode = findRegionCodeInAddress(address);
      displayRegionLabel = PROVINCIAL_DISPLAY_LABEL;
      if (displayRegionCode === null) {
        warnings.push(
          `[${source.key}] 연번 ${rowNumber}: 광역 시설의 소재 시·군을 주소에서 찾지 못함`,
        );
      }
    } else {
      const region = findRegionBySourceLabel(sourceRegion);
      if (region === null) {
        errors.push(`[${source.key}] 연번 ${rowNumber}: 미정의 지역값 "${sourceRegion}"`);
        return;
      }
      displayRegionCode = region.code;
      displayRegionLabel = region.label;
    }

    const category = findCategoryBySourceLabel(categorySource);
    if (category === null) {
      errors.push(`[${source.key}] 연번 ${rowNumber}: 미정의 업종값 "${categorySource}"`);
      return;
    }

    if (benefitTypeRaw !== "면제" && benefitTypeRaw !== "할인") {
      errors.push(
        `[${source.key}] 연번 ${rowNumber}: 면제/할인 값이 유효하지 않음 "${benefitTypeRaw}"`,
      );
      return;
    }

    // 필수값 누락 → needs_review, 기본 공개 제외 (PRD 10.5)
    const missingRequired =
      sourceRegion === "" ||
      categorySource === "" ||
      facilityName === "" ||
      toNullable(benefitTarget) === null ||
      toNullable(benefitDescription) === null;

    const duplicateKey = `${sourceRegion}|${categorySource}|${facilityName}`;
    duplicateKeys.set(duplicateKey, [
      ...(duplicateKeys.get(duplicateKey) ?? []),
      facilityId,
    ]);

    const mapLink = mapLinkByRow.get(rowNumber);

    facilities.push({
      facilityId,
      sourceKey: source.key,
      sourceRowNumber: rowNumber,
      sourceRegion,
      isProvincial,
      displayRegionCode,
      displayRegionLabel,
      categorySource,
      categoryCode: category.code,
      categoryLabel: category.label,
      facilityName,
      benefitTarget,
      benefitDescription,
      benefitType: benefitTypeRaw,
      organizationType,
      note,
      homepageUrl,
      naverMapUrl: mapLink?.url ?? null,
      naverPlaceId: mapLink?.placeId ?? null,
      lat: mapLink?.lat ?? null,
      lng: mapLink?.lng ?? null,
      address,
      phoneDisplay,
      phoneTel,
      imageUrl: null,
      sourceUpdatedAt: DATA_UPDATED_AT,
      dataStatus: missingRequired ? "needs_review" : "published",
      isActive: !missingRequired,
    });
  });

  return { facilities, errors, warnings };
}

/** 변환 리포트 — PRD 10.1 수치 및 계획서 §2.3 기준값과 대조용 */
function printStats(facilities: Facility[], indent: string): void {
  const count = (predicate: (facility: Facility) => boolean) =>
    facilities.filter(predicate).length;
  const needsReview = facilities.filter((f) => f.dataStatus === "needs_review");
  console.log(`${indent}총 시설: ${facilities.length}건`);
  console.log(`${indent}공개(published): ${count((f) => f.isActive)}건`);
  console.log(
    `${indent}비공개(needs_review): ${needsReview.length}건${
      needsReview.length > 0
        ? ` — ${needsReview.map((f) => f.facilityId).join(", ")}`
        : ""
    }`,
  );
  console.log(`${indent}광역(경기도): ${count((f) => f.isProvincial)}건`);
  console.log(`${indent}홈페이지 URL: ${count((f) => f.homepageUrl !== null)}건`);
  console.log(`${indent}주소: ${count((f) => f.address !== null)}건`);
  console.log(`${indent}전화 실행 가능: ${count((f) => f.phoneTel !== null)}건`);
  console.log(`${indent}비고: ${count((f) => f.note !== null)}건`);
  console.log(
    `${indent}지도 링크: ${count((f) => (f.naverMapUrl ?? null) !== null)}건 (그중 정밀 링크 ${count(
      (f) => f.naverMapUrl?.includes("/entry/place/") ?? false,
    )}건)`,
  );
  console.log(`${indent}좌표: ${count((f) => f.lat !== null && f.lng !== null)}건`);
}

async function main(): Promise<void> {
  const duplicateKeys = new Map<string, string[]>();
  const facilities: Facility[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const perSource: Array<{ source: SourceDefinition; facilities: Facility[] }> = [];

  for (const source of SOURCES) {
    const result = await convertSource(source, duplicateKeys);
    facilities.push(...result.facilities);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    perSource.push({ source, facilities: result.facilities });
  }

  // 중복 의심은 자동 병합하지 않고 경고만 남긴다 (PRD 10.5). 판정은 소스 통합 기준
  for (const [key, facilityIds] of duplicateKeys) {
    if (facilityIds.length > 1) {
      warnings.push(`중복 의심: ${key} (${facilityIds.join(", ")})`);
    }
  }

  if (errors.length > 0) {
    console.error(`변환 중단 — 오류 ${errors.length}건:`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  const dataset: FacilityDataset = {
    dataUpdatedAt: DATA_UPDATED_AT,
    facilities,
  };

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

  console.log("변환 완료:", OUTPUT_FILE);
  for (const { source, facilities: sourceFacilities } of perSource) {
    console.log(`\n[${source.key}] ${source.label} — ${source.file}`);
    printStats(sourceFacilities, "    ");
  }
  console.log("\n[전체 합계]");
  printStats(facilities, "    ");

  if (warnings.length > 0) {
    console.log(`\n경고 ${warnings.length}건:`);
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

await main();
