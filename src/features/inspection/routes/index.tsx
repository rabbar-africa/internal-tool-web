import { lazyImport } from "@/utils/lazyImports";
import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";

const { ViewAllInspectionReports } = lazyImport(
  () => import("../pages/ViewAllReports"),
  "ViewAllInspectionReports",
);

const { GenerateInspection } = lazyImport(
  () => import("../pages/GenerateInspection"),
  "GenerateInspection",
);

export const InspectionRoutes: RouteObject[] = [
  {
    path: RouteConstants.inspection.base.path,
    element: <ViewAllInspectionReports />,
  },
  {
    path: RouteConstants.inspection.createInspection.path,
    element: <GenerateInspection />,
  },
];
