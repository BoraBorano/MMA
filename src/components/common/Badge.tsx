import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** 색상 외에 텍스트를 항상 포함한다 (PRD 9장 Badge 규칙, A11Y-011). */
const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-sm font-bold",
  {
    variants: {
      variant: {
        progress: "bg-blue-soft text-navy",
        comingSoon: "bg-gold-soft text-navy-deep",
        provincial: "border border-navy bg-surface text-navy",
      },
    },
    defaultVariants: {
      variant: "progress",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
