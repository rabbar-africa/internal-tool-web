import { lazyImport } from "@/utils/lazyImports";
import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";

const { ViewAllReportsPage } = lazyImport(
  () => import("../pages/ViewAllReportsPage"),
  "ViewAllReportsPage",
);

const { GenerateInspectionPage } = lazyImport(
  () => import("../pages/GenerateInspectionPage"),
  "GenerateInspectionPage",
);

const { InspectionDetailPage } = lazyImport(
  () => import("../pages/InspectionDetailPage"),
  "InspectionDetailPage",
);

const { EditInspectionPage } = lazyImport(
  () => import("../pages/EditInspectionPage"),
  "EditInspectionPage",
);

export const InspectionRoutes: RouteObject[] = [
  {
    path: RouteConstants.inspection.base.path,
    element: <ViewAllReportsPage />,
  },
  {
    path: RouteConstants.inspection.createInspection.path,
    element: <GenerateInspectionPage />,
  },
  {
    path: RouteConstants.inspection.inspectionDetails.path,
    element: <InspectionDetailPage />,
  },
  {
    path: RouteConstants.inspection.edit.path,
    element: <EditInspectionPage />,
  },
];
