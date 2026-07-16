import { Search, X } from "lucide-react";

interface FacilitySearchProps {
  value: string;
  onChange: (value: string) => void;
}

/** 시설명 검색 — 아이콘+입력+지우기 (PRD 6.3.1·6.3.2). 입력 즉시 결과 갱신 (FR-011). */
export function FacilitySearch({ value, onChange }: FacilitySearchProps) {
  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        role="searchbox"
        aria-label="시설 이름으로 찾기"
        placeholder="시설 이름으로 찾기"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-md border border-line bg-surface py-2 pl-10 pr-11 text-base text-ink placeholder:text-muted"
      />
      {value !== "" && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => onChange("")}
          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-blue-soft hover:text-navy"
        >
          <X aria-hidden="true" size={18} />
        </button>
      )}
    </div>
  );
}
