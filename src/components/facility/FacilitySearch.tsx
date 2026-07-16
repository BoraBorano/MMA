import { SearchInput } from "@/components/common/SearchInput";

interface FacilitySearchProps {
  value: string;
  onChange: (value: string) => void;
}

/** 시설명 검색 (PRD 6.3.1·6.3.2). 입력 즉시 결과 갱신 (FR-011). */
export function FacilitySearch({ value, onChange }: FacilitySearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      ariaLabel="시설 이름으로 찾기"
      placeholder="시설 이름으로 찾기"
    />
  );
}
