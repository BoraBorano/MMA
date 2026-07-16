import { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

let hasNavigatedOnce = false;

/**
 * 화면 전환 후 새 화면의 제목으로 포커스를 이동한다 (A11Y-009).
 * 최초 진입 시에는 이동하지 않는다(브라우저 기본 포커스 유지).
 *
 * 콜백 ref로 구현한다 — FacilityDetailPage처럼 비동기 로드가 끝난 뒤에야
 * 제목이 처음 마운트되는 화면에서도, pathname effect(마운트 시 1회)가 아니라
 * "DOM에 실제로 붙는 시점"에 맞춰 포커스해야 정확히 동작한다.
 */
export function useFocusOnNavigate(): (node: HTMLHeadingElement | null) => void {
  const { pathname } = useLocation();

  useEffect(() => {
    hasNavigatedOnce = true;
  }, [pathname]);

  return useCallback((node: HTMLHeadingElement | null) => {
    if (node !== null && hasNavigatedOnce) {
      node.focus();
    }
  }, []);
}
