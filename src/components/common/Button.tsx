import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * 버튼 상태 규칙 (PRD 9.1)
 * - Primary: 남색 배경·흰색 글자 — 가장 중요한 다음 행동
 * - Secondary: surface 배경·남색 테두리 — 보조 행동
 * - Text: 배경 없음·남색 글자 — 이전 화면·경로 이동
 * 포커스 외곽선은 전역 :focus-visible 스타일(3px gold)을 따른다.
 */
export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-bold",
    "min-h-12 px-4 text-base", // A11Y-004: 주요 선택 버튼 48px 이상
    "transition-colors active:translate-y-px",
    // Disabled: 흐림 대신 명확한 대비 유지 + 텍스트로 상태 설명 (PRD 9.1)
    "disabled:pointer-events-none disabled:border-transparent disabled:bg-line disabled:text-ink",
  ),
  {
    variants: {
      variant: {
        primary: "bg-navy text-surface hover:bg-navy-deep",
        secondary: "border-2 border-navy bg-surface text-navy hover:bg-blue-soft",
        text: "min-h-11 bg-transparent px-2 text-navy underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
