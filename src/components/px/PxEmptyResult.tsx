import { Button } from "@/components/common/Button";

interface PxEmptyResultProps {
  onReset: () => void;
}

/** 검색·지역 필터 결과가 없을 때 표시하며, 필터 초기화 행동을 제공한다. */
export function PxEmptyResult({ onReset }: PxEmptyResultProps) {
  return (
    <div className="py-16 text-center">
      <h2 className="text-lg font-bold text-navy-deep">검색 결과가 없어요</h2>
      <p className="mt-2 text-muted">지역명이나 군마트 이름을 다시 확인해 주세요.</p>
      <Button onClick={onReset} variant="secondary" className="mt-6">
        검색·지역 필터 초기화
      </Button>
    </div>
  );
}
