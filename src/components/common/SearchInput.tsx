import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder: string;
}

/**
 * 검색 입력 — 아이콘+입력+지우기. 입력 즉시 결과 갱신하는 화면에서 재사용한다.
 * type="search"의 브라우저 기본 지우기 버튼은 숨긴다. 커스텀 지우기 버튼과 겹쳐
 * X가 두 개로 보이는 문제를 막기 위함이다 (QA BUG-002).
 */
export function SearchInput({ value, onChange, ariaLabel, placeholder }: SearchInputProps) {
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
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-md border border-line bg-surface py-2 pl-10 pr-11 text-base text-ink placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
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
