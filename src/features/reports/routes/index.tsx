import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { ReportsPage } = lazyImport(
  () => import("../pages/ReportsPage"),
  "ReportsPage",
);

export const ReportRoutes: RouteObject[] = [
  {
    path: RouteConstants.reports.base.path,
    element: <ReportsPage />,
  },
];
