import { Route, Routes } from "react-router-dom";
import { CategorySelectionPage } from "@/pages/CategorySelectionPage";
import { FacilityDetailPage } from "@/pages/FacilityDetailPage";
import { FacilityListPage } from "@/pages/FacilityListPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RegionSelectionPage } from "@/pages/RegionSelectionPage";
import { StyleguidePage } from "@/pages/StyleguidePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RegionSelectionPage />} />
      <Route path="/region/:regionCode" element={<CategorySelectionPage />} />
      <Route
        path="/region/:regionCode/:categoryCode"
        element={<FacilityListPage />}
      />
      <Route path="/facility/:facilityId" element={<FacilityDetailPage />} />
      {import.meta.env.DEV && (
        <Route path="/dev/styleguide" element={<StyleguidePage />} />
      )}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
