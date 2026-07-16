import {
  Dumbbell,
  GraduationCap,
  Landmark,
  Luggage,
  SquareParking,
  Star,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import type { CategoryCode } from "@/types";

/** 업종별 선형 아이콘 (PRD 6.2, iconName은 categoryConfig 참고용 문자열이다) */
export const CATEGORY_ICONS: Record<CategoryCode, LucideIcon> = {
  education: GraduationCap,
  culture: Landmark,
  lodging: Luggage,
  medical: Stethoscope,
  parking: SquareParking,
  sports: Dumbbell,
  etc: Star,
};
