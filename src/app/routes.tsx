import { Route, Routes } from "react-router-dom";
import { CategorySelectionPage } from "@/pages/CategorySelectionPage";
import { FacilityDetailPage } from "@/pages/FacilityDetailPage";
import { FacilityListPage } from "@/pages/FacilityListPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PxDetailPage } from "@/pages/PxDetailPage";
import { PxFinderPage } from "@/pages/PxFinderPage";
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
      <Route path="/px" element={<PxFinderPage />} />
      <Route path="/px/:storeId" element={<PxDetailPage />} />
      {import.meta.env.DEV && (
        <Route path="/dev/styleguide" element={<StyleguidePage />} />
      )}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
