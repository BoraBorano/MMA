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
  normalizeNote,
  normalizeWhitespace,
  parsePhone,
  toNullable,
  validateHomepageUrl,
} from "../src/lib/dataConvert/transforms";
import type { Facility, FacilityDataset } from "../src/types";

const SOURCE_FILE = path.resolve(
  import.meta.dirname,
  "../data-source/경인_예우시설_2026_4_30_업데이트_정리.xlsx",
);
const OUTPUT_FILE = path.resolve(import.meta.dirname, "../public/data/facilities.json");
const NAVER_MAP_LINKS_FILE = path.resolve(
  import.meta.dirname,
  "../data-source/naver-map-facility-links.json",
);
const DATA_UPDATED_AT = "2026-04-30";

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

async function main(): Promise<void> {
  const naverMapLinks = JSON.parse(await readFile(NAVER_MAP_LINKS_FILE, "utf8")) as Array<{
    sourceRowNumber: number;
    url: string | null;
  }>;
  const naverMapUrlByRow = new Map(
    naverMapLinks.map(({ sourceRowNumber, url }) => [sourceRowNumber, url]),
  );
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(SOURCE_FILE);
  const sheet = workbook.worksheets[0];
  if (sheet === undefined) {
    throw new Error("워크시트를 찾을 수 없습니다");
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const facilities: Facility[] = [];
  const seenRowNumbers = new Set<number>();
  const duplicateKeys = new Map<string, number[]>();

  sheet.eachRow((row, excelRowIndex) => {
    if (excelRowIndex === 1) {
      return; // 헤더
    }

    const rowNumber = Number(normalizeWhitespace(cellText(row, COLUMNS.rowNumber)));
    if (!Number.isInteger(rowNumber) || rowNumber <= 0) {
      errors.push(`엑셀 ${excelRowIndex}행: 연번이 유효하지 않습니다`);
      return;
    }
    if (seenRowNumbers.has(rowNumber)) {
      errors.push(`연번 ${rowNumber}: 중복된 연번`);
      return;
    }
    seenRowNumbers.add(rowNumber);

    const sourceRegion = normalizeWhitespace(cellText(row, COLUMNS.region));
    const categorySource = normalizeWhitespace(cellText(row, COLUMNS.category));
    const facilityName = normalizeWhitespace(cellText(row, COLUMNS.name));
    const benefitTarget = normalizeWhitespace(cellText(row, COLUMNS.target));
    const benefitDescription = normalizeWhitespace(cellText(row, COLUMNS.benefit));
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
        warnings.push(`연번 ${rowNumber}: 광역 시설의 소재 시·군을 주소에서 찾지 못함`);
      }
    } else {
      const region = findRegionBySourceLabel(sourceRegion);
      if (region === null) {
        errors.push(`연번 ${rowNumber}: 미정의 지역값 "${sourceRegion}"`);
        return;
      }
      displayRegionCode = region.code;
      displayRegionLabel = region.label;
    }

    const category = findCategoryBySourceLabel(categorySource);
    if (category === null) {
      errors.push(`연번 ${rowNumber}: 미정의 업종값 "${categorySource}"`);
      return;
    }

    if (benefitTypeRaw !== "면제" && benefitTypeRaw !== "할인") {
      errors.push(`연번 ${rowNumber}: 면제/할인 값이 유효하지 않음 "${benefitTypeRaw}"`);
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
      rowNumber,
    ]);

    facilities.push({
      facilityId: `f-${String(rowNumber).padStart(3, "0")}`,
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
      naverMapUrl: naverMapUrlByRow.get(rowNumber) ?? null,
      address,
      phoneDisplay,
      phoneTel,
      imageUrl: null,
      sourceUpdatedAt: DATA_UPDATED_AT,
      dataStatus: missingRequired ? "needs_review" : "published",
      isActive: !missingRequired,
    });
  });

  // 중복 의심은 자동 병합하지 않고 경고만 남긴다 (PRD 10.5)
  for (const [key, rowNumbers] of duplicateKeys) {
    if (rowNumbers.length > 1) {
      warnings.push(`중복 의심: ${key} (연번 ${rowNumbers.join(", ")})`);
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

  // 변환 리포트 — PRD 10.1 수치와 대조용
  const active = facilities.filter((facility) => facility.isActive);
  const count = (predicate: (facility: Facility) => boolean) =>
    facilities.filter(predicate).length;
  console.log("변환 완료:", OUTPUT_FILE);
  console.log(`  총 시설: ${facilities.length}건`);
  console.log(`  공개(published): ${active.length}건`);
  console.log(
    `  비공개(needs_review): ${count((f) => f.dataStatus === "needs_review")}건 — 연번 ${facilities
      .filter((f) => f.dataStatus === "needs_review")
      .map((f) => f.sourceRowNumber)
      .join(", ")}`,
  );
  console.log(`  광역(경기도): ${count((f) => f.isProvincial)}건`);
  console.log(`  홈페이지 URL: ${count((f) => f.homepageUrl !== null)}건`);
  console.log(`  주소: ${count((f) => f.address !== null)}건`);
  console.log(`  전화 실행 가능: ${count((f) => f.phoneTel !== null)}건`);
  console.log(`  비고: ${count((f) => f.note !== null)}건`);
  if (warnings.length > 0) {
    console.log(`경고 ${warnings.length}건:`);
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

await main();
