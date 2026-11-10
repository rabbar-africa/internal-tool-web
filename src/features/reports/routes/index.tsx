import type { RouteObject } from "react-router-dom";
import { guarded } from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { ReportsPage } = lazyImport(
  () => import("../pages/ReportsPage"),
  "ReportsPage",
);

export const ReportRoutes: RouteObject[] = [
  guarded("reports", {
    path: RouteConstants.reports.base.path,
    element: <ReportsPage />,
  }),
];
