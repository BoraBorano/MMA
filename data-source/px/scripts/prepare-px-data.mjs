import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(scriptDir, '..')
const projectRoot = path.resolve(root, '..', '..')
const sourceDir = path.join(root, 'source')

const OFFICIAL_DATA_URL = 'https://www.data.go.kr/data/15126305/fileData.do'
const OFFICIAL_SHEET_URL = 'https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9645'
const WELFARE_PORTAL_URL = 'https://www.welfare.mil.kr'
const REFERENCE_DATE = '2026-04-28'

const gyeonggiRegions = [
  '수원시', '용인시', '고양시', '화성시', '성남시', '부천시', '남양주시', '안산시', '평택시', '안양시',
  '시흥시', '파주시', '김포시', '의정부시', '광주시', '하남시', '광명시', '군포시', '양주시', '오산시',
  '이천시', '구리시', '안성시', '의왕시', '포천시', '양평군', '여주시', '동두천시', '과천시', '가평군', '연천군',
]

function parseOfficial(raw) {
  const jsonLike = raw
    .trim()
    .replace(/([{,]\s*)([A-Z_]+):/g, '$1"$2":')
    .replace(/,(\s*[}\]])/g, '$1')
  const parsed = JSON.parse(jsonLike)
  if (parsed.TOTAL !== 120 || parsed.DATA.length !== 120) {
    throw new Error(`Official data integrity check failed: TOTAL=${parsed.TOTAL}, rows=${parsed.DATA.length}`)
  }
  return parsed.DATA
}

function parseSecondary(raw) {
  const start = raw.indexOf('t=[{id:1')
  const end = raw.indexOf('],s=()=>', start)
  if (start < 0 || end < 0) throw new Error('Could not locate coordinate candidate array')

  const jsonLike = raw
    .slice(start + 2, end + 1)
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => `\\u00${hex}`)
    .replace(/([{,])([a-zA-Z_][\w]*):/g, '$1"$2":')
    .replace(/:!0(?=[,}])/g, ':true')
    .replace(/:!1(?=[,}])/g, ':false')
  const parsed = JSON.parse(jsonLike)
  if (parsed.length < 120) throw new Error(`Coordinate candidate set is unexpectedly small: ${parsed.length}`)
  return parsed
}

function normalizeName(value) {
  return value
    .replace(/\(\s*영외\s*\)/g, '')
    .replace(/\s+/g, '')
    .trim()
}

function normalizeAddress(value) {
  return value
    .replace(/^경기\s+/, '경기도 ')
    .replace(/^서울시\s+/, '서울특별시 ')
    .replace(/[·ㆍ]/g, ' ')
    .replace(/\s+/g, '')
    .replace(/[(),.-]/g, '')
}

function phoneDigits(value) {
  return (value ?? '').replace(/\D/g, '')
}

function getRegion(address) {
  return gyeonggiRegions.find((region) => address.includes(region)) ?? null
}

function isGyeonggi(address) {
  const trimmed = address.trim()
  return /^(?:경기도|경기)\s/.test(trimmed) || /^(?:양주시|파주시)\s/.test(trimmed)
}

function addressScore(left, right) {
  const a = normalizeAddress(left)
  const b = normalizeAddress(right)
  if (a === b) return 1
  if (a.includes(b) || b.includes(a)) return 0.92
  const length = Math.min(a.length, b.length)
  let prefix = 0
  while (prefix < length && a[prefix] === b[prefix]) prefix += 1
  return prefix / Math.max(a.length, b.length)
}

function findCoordinateCandidate(row, candidates) {
  const officialName = normalizeName(row.MART)
  const sameName = candidates.filter((item) => normalizeName(item.name) === officialName)
  if (sameName.length === 0) return { candidate: null, status: 'unmatched' }

  const ranked = sameName
    .map((candidate) => ({
      candidate,
      score: addressScore(row.LOC, candidate.address),
      phoneMatch: phoneDigits(row.TEL) !== '' && phoneDigits(row.TEL) === phoneDigits(candidate.phone),
    }))
    .sort((a, b) => Number(b.phoneMatch) - Number(a.phoneMatch) || b.score - a.score)

  const best = ranked[0]
  if (best.score >= 0.72 || best.phoneMatch) {
    return {
      candidate: best.candidate,
      status: best.score >= 0.9 ? 'matched_name_and_address' : best.phoneMatch ? 'matched_name_and_phone' : 'matched_name_address_reviewed',
      addressScore: Number(best.score.toFixed(3)),
    }
  }
  return { candidate: null, status: 'name_match_rejected_address_mismatch', addressScore: Number(best.score.toFixed(3)) }
}

// EPSG:5179 (Korea 2000 / Unified CS) forward projection, GRS80 ellipsoid.
function projectWgs84To5179(latDeg, lonDeg) {
  const a = 6378137
  const inverseFlattening = 298.257222101
  const flattening = 1 / inverseFlattening
  const e2 = 2 * flattening - flattening * flattening
  const ep2 = e2 / (1 - e2)
  const lat = latDeg * Math.PI / 180
  const lon = lonDeg * Math.PI / 180
  const lat0 = 38 * Math.PI / 180
  const lon0 = 127.5 * Math.PI / 180
  const k0 = 0.9996
  const x0 = 1_000_000
  const y0 = 2_000_000

  const meridionalArc = (phi) => {
    const e4 = e2 * e2
    const e6 = e4 * e2
    return a * (
      (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * phi
      - (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * phi)
      + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * phi)
      - (35 * e6 / 3072) * Math.sin(6 * phi)
    )
  }

  const sin = Math.sin(lat)
  const cos = Math.cos(lat)
  const tan = Math.tan(lat)
  const n = a / Math.sqrt(1 - e2 * sin * sin)
  const t = tan * tan
  const c = ep2 * cos * cos
  const aa = cos * (lon - lon0)
  const m = meridionalArc(lat)
  const m0 = meridionalArc(lat0)

  const x = x0 + k0 * n * (
    aa + (1 - t + c) * aa ** 3 / 6
    + (5 - 18 * t + t ** 2 + 72 * c - 58 * ep2) * aa ** 5 / 120
  )
  const y = y0 + k0 * (
    m - m0 + n * tan * (
      aa ** 2 / 2
      + (5 - t + 9 * c + 4 * c ** 2) * aa ** 4 / 24
      + (61 - 58 * t + t ** 2 + 600 * c - 330 * ep2) * aa ** 6 / 720
    )
  )
  return { x, y }
}

function collectCoordinatePairs(value, target) {
  if (Array.isArray(value) && value.length >= 2 && value.slice(0, 2).every(Number.isFinite)) {
    target.push(value.slice(0, 2))
    return
  }
  if (Array.isArray(value)) value.forEach((child) => collectCoordinatePairs(child, target))
}

function geoBounds(geojson) {
  const points = []
  geojson.features.forEach((feature) => collectCoordinatePairs(feature.geometry.coordinates, points))
  return {
    minX: Math.min(...points.map(([x]) => x)),
    maxX: Math.max(...points.map(([x]) => x)),
    minY: Math.min(...points.map(([, y]) => y)),
    maxY: Math.max(...points.map(([, y]) => y)),
  }
}

function toSvgPoint(lat, lng, bounds) {
  const projected = projectWgs84To5179(lat, lng)
  return {
    svgX: Number((1 + (projected.x - bounds.minX) / (bounds.maxX - bounds.minX) * 798).toFixed(2)),
    svgY: Number((1 + (bounds.maxY - projected.y) / (bounds.maxY - bounds.minY) * 942).toFixed(2)),
  }
}

function pointInPolygon([x, y], polygon) {
  let inside = false
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [x1, y1] = polygon[index]
    const [x2, y2] = polygon[previous]
    const crosses = (y1 > y) !== (y2 > y)
      && x < (x2 - x1) * (y - y1) / (y2 - y1) + x1
    if (crosses) inside = !inside
  }
  return inside
}

function pathPoints(pathData) {
  const values = [...pathData.matchAll(/-?\d+(?:\.\d+)?/g)].map(([value]) => Number(value))
  const points = []
  for (let index = 0; index < values.length; index += 2) points.push([values[index], values[index + 1]])
  return points
}

function ensureMarkerInsideRegion(point, regionName, mapRegions) {
  if (point.svgX == null || point.svgY == null) return { ...point, markerPositionStatus: 'unavailable' }
  const region = mapRegions.find((item) => item.region === regionName)
  if (!region) return { ...point, markerPositionStatus: 'region_shape_missing' }
  const inside = region.paths.some((pathData) => pointInPolygon([point.svgX, point.svgY], pathPoints(pathData)))
  if (inside) return { ...point, markerPositionStatus: 'projected-coordinate' }
  return {
    ...point,
    svgX: region.label[0],
    svgY: region.label[1],
    markerPositionStatus: 'adjusted-to-region-label',
  }
}

function slugify(value, index) {
  return `${String(index + 1).padStart(2, '0')}-${normalizeName(value).replace(/[^0-9A-Za-z가-힣]/g, '-').toLowerCase()}`
}

function csvEscape(value) {
  const stringValue = value == null ? '' : String(value)
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
}

const [officialRaw, secondaryRaw, geoRaw, portableMapRaw] = await Promise.all([
  fs.readFile(path.join(sourceDir, 'mnd-px-official-20260428.txt'), 'utf8'),
  fs.readFile(path.join(sourceDir, 'secondary-coordinate-candidates.js'), 'utf8'),
  fs.readFile(path.join(sourceDir, 'gyeonggi-sigungu-2020.json'), 'utf8'),
  fs.readFile(path.join(projectRoot, 'src', 'data', 'gyeonggi-map.json'), 'utf8'),
])

const officialRows = parseOfficial(officialRaw)
const coordinateCandidates = parseSecondary(secondaryRaw)
const gyeonggiGeo = JSON.parse(geoRaw)
const mapRegions = JSON.parse(portableMapRaw)
const bounds = geoBounds(gyeonggiGeo)

const gyeonggiRows = officialRows
  .filter((row) => isGyeonggi(row.LOC))
  .sort((a, b) => {
    const regionCompare = (getRegion(a.LOC) ?? '').localeCompare(getRegion(b.LOC) ?? '', 'ko')
    return regionCompare || normalizeName(a.MART).localeCompare(normalizeName(b.MART), 'ko')
  })

const stores = gyeonggiRows.map((row, index) => {
  const match = findCoordinateCandidate(row, coordinateCandidates)
  const name = row.MART.replace(/\(\s*영외\s*\)/g, '').trim()
  const query = `국군복지단 ${name} 군마트 ${row.LOC}`
  const coordinate = match.candidate
    ? {
        lat: match.candidate.lat,
        lng: match.candidate.lng,
        ...toSvgPoint(match.candidate.lat, match.candidate.lng, bounds),
      }
    : { lat: null, lng: null, svgX: null, svgY: null }
  const region = getRegion(row.LOC)?.replace(/[시군]$/, '') ?? ''
  const markerPoint = ensureMarkerInsideRegion(coordinate, region, mapRegions)

  return {
    id: slugify(name, index),
    name,
    officialName: row.MART,
    region,
    address: row.LOC,
    phone: row.TEL,
    hours: {
      weekday: row.OP_WEEKDAY || '휴무 또는 미제공',
      saturday: row.OP_SAT || '휴무 또는 미제공',
      sunday: row.OP_SUN || '휴무 또는 미제공',
    },
    lunchHours: {
      weekday: row.LUNCH_WEEKDAY || '',
      saturday: row.LUNCH_SAT || '',
      sunday: row.LUNCH_SUN || '',
    },
    note: row.NOTE || '',
    ...markerPoint,
    coordinateSource: match.candidate ? 'secondary-candidate-cross-checked' : null,
    coordinateMatchStatus: match.status,
    coordinateAddressScore: match.addressScore ?? null,
    naverMapUrl: `https://map.naver.com/p/search/${encodeURIComponent(query)}`,
    naverMapLinkType: 'search-deep-link',
    welfarePortalUrl: WELFARE_PORTAL_URL,
    welfareLinkType: 'portal-home',
  }
})

const output = {
  metadata: {
    title: '경기도 국군복지단 영외마트 PX 편의 데이터',
    generatedAt: new Date().toISOString(),
    officialReferenceDate: REFERENCE_DATE,
    officialRowCountNationwide: officialRows.length,
    gyeonggiStoreCount: stores.length,
    officialDataUrl: OFFICIAL_DATA_URL,
    officialSheetUrl: OFFICIAL_SHEET_URL,
    officialFields: ['name', 'address', 'phone', 'hours', 'lunchHours', 'note'],
    coordinateNotice: '좌표는 국방부 원본 제공 필드가 아니며, 2차 공개 자료의 이름·주소·전화번호를 공식 자료와 대조한 표시용 후보값입니다.',
    naverLinkNotice: '네이버 장소 ID가 아닌 네이버지도 검색 딥링크입니다.',
    operatingHoursNotice: '영업시간과 휴점 정보는 변경될 수 있으므로 방문 전 매장 전화 또는 국군복지포털에서 재확인해야 합니다.',
    licenseNotice: '공식 원본의 출처를 반드시 표시하고, 이 필터링·표준화 파일을 국방부 공식 원본으로 표현하지 마세요.',
  },
  stores,
}

const csvColumns = [
  'id', 'name', 'officialName', 'region', 'address', 'phone',
  'weekdayHours', 'saturdayHours', 'sundayHours',
  'weekdayLunch', 'saturdayLunch', 'sundayLunch', 'note',
  'lat', 'lng', 'svgX', 'svgY', 'coordinateMatchStatus', 'coordinateAddressScore',
  'naverMapUrl', 'welfarePortalUrl',
]
const csvRows = stores.map((store) => [
  store.id, store.name, store.officialName, store.region, store.address, store.phone,
  store.hours.weekday, store.hours.saturday, store.hours.sunday,
  store.lunchHours.weekday, store.lunchHours.saturday, store.lunchHours.sunday, store.note,
  store.lat, store.lng, store.svgX, store.svgY, store.coordinateMatchStatus, store.coordinateAddressScore,
  store.naverMapUrl, store.welfarePortalUrl,
])
const csv = [csvColumns, ...csvRows].map((row) => row.map(csvEscape).join(',')).join('\n') + '\n'

const coordinateMatched = stores.filter((store) => store.lat != null)
const report = {
  generatedAt: output.metadata.generatedAt,
  officialNationwideRows: officialRows.length,
  officialGyeonggiRows: stores.length,
  coordinateMatched: coordinateMatched.length,
  coordinateCoveragePercent: Number((coordinateMatched.length / stores.length * 100).toFixed(1)),
  unmatchedCoordinates: stores
    .filter((store) => store.lat == null)
    .map(({ name, address, phone, coordinateMatchStatus, coordinateAddressScore }) => ({ name, address, phone, coordinateMatchStatus, coordinateAddressScore })),
  outOfSvgBounds: stores
    .filter((store) => store.svgX != null && (store.svgX < 0 || store.svgX > 800 || store.svgY < 0 || store.svgY > 944))
    .map(({ name, svgX, svgY }) => ({ name, svgX, svgY })),
  markerPositionsAdjustedToRegion: stores
    .filter((store) => store.markerPositionStatus === 'adjusted-to-region-label')
    .map(({ name, region, lat, lng, svgX, svgY }) => ({ name, region, lat, lng, svgX, svgY })),
  validation: {
    uniqueIds: new Set(stores.map((store) => store.id)).size === stores.length,
    allHaveRequiredOfficialFields: stores.every((store) => store.name && store.address && store.hours.weekday && store.naverMapUrl),
    allLinksUseHttps: stores.every((store) => store.naverMapUrl.startsWith('https://') && store.welfarePortalUrl.startsWith('https://')),
  },
}

await Promise.all([
  fs.writeFile(path.join(root, 'px-stores-gyeonggi.json'), JSON.stringify(output, null, 2) + '\n', 'utf8'),
  fs.writeFile(path.join(root, 'px-stores-gyeonggi.csv'), '\uFEFF' + csv, 'utf8'),
  fs.writeFile(path.join(root, 'data-quality-report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8'),
  fs.writeFile(path.join(root, 'gyeonggi-map.json'), portableMapRaw, 'utf8'),
])

console.log(`Prepared ${stores.length} official Gyeonggi PX rows`)
console.log(`Coordinate coverage: ${coordinateMatched.length}/${stores.length} (${report.coordinateCoveragePercent}%)`)
console.log(`Unmatched: ${report.unmatchedCoordinates.map((item) => item.name).join(', ') || 'none'}`)
