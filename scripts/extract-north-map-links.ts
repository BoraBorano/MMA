/**
 * 경기북부 통합 엑셀 13~18열 → naver-map-facility-links.north.json 추출.
 *
 * 실행: npx tsx scripts/extract-north-map-links.ts
 *
 * 북부 원본은 원본 12컬럼과 네이버지도 수집 결과가 이미 정합하게 병합된 통합본이다.
 * 별도 링크 파일(병역명문가_네이버지도_링크.xlsx)은 폐관 시설을 포함해 연번이
 * 어긋나므로 참조하지 않는다.
 */
import path from "node:path";
import { writeFile } from "node:fs/promises";
import ExcelJS from "exceljs";

const SOURCE_FILE = path.resolve(
  import.meta.dirname,
  "../data-source/경기북부_예우시설_2026_4_30_정리.xlsx",
);
const OUTPUT_FILE = path.resolve(
  import.meta.dirname,
  "../data-source/naver-map-facility-links.north.json",
);

/** 통합본 열 번호 — 1~12열은 기존 스키마와 동일, 13열부터가 수집 결과다. */
const COLUMNS = {
  rowNumber: 1,
  url: 15,
  placeId: 16,
  lat: 17,
  lng: 18,
} as const;

function cellText(row: ExcelJS.Row, column: number): string {
  const cell = row.getCell(column);
  const value = cell.value;
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    if ("hyperlink" in value && typeof value.hyperlink === "string") {
      const text = "text" in value ? String(value.text ?? "") : "";
      return text.trim() !== "" ? text : value.hyperlink;
    }
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("");
    }
    return cell.text;
  }
  return String(value);
}

interface NorthMapLink {
  sourceRowNumber: number;
  url: string | null;
  placeId: string | null;
  lat: number | null;
  lng: number | null;
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

async function main(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(SOURCE_FILE);
  const sheet = workbook.worksheets[0];
  if (sheet === undefined) {
    throw new Error("워크시트를 찾을 수 없습니다");
  }

  const links: NorthMapLink[] = [];
  sheet.eachRow((row, excelRowIndex) => {
    if (excelRowIndex === 1) {
      return; // 헤더
    }
    const rowNumber = Number(cellText(row, COLUMNS.rowNumber).trim());
    if (!Number.isInteger(rowNumber) || rowNumber <= 0) {
      return;
    }
    const url = cellText(row, COLUMNS.url).trim();
    const placeId = cellText(row, COLUMNS.placeId).trim();
    links.push({
      sourceRowNumber: rowNumber,
      url: url === "" ? null : url,
      placeId: placeId === "" ? null : placeId,
      lat: toNullableNumber(cellText(row, COLUMNS.lat)),
      lng: toNullableNumber(cellText(row, COLUMNS.lng)),
    });
  });

  await writeFile(OUTPUT_FILE, `${JSON.stringify(links, null, 2)}\n`, "utf8");

  const withUrl = links.filter((link) => link.url !== null).length;
  const withEntry = links.filter((link) => link.url?.includes("/entry/place/")).length;
  const withCoords = links.filter((link) => link.lat !== null && link.lng !== null).length;
  console.log("추출 완료:", OUTPUT_FILE);
  console.log(`  총 ${links.length}건 / 링크 ${withUrl}건 (그중 entry/place ${withEntry}건)`);
  console.log(`  place_id ${links.filter((l) => l.placeId !== null).length}건 / 좌표 ${withCoords}건`);
}

await main();
