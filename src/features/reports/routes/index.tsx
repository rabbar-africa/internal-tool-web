import type { RouteObject } from "react-router-dom";
import { guarded } from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { ReportsPage } = lazyImport(
  () => import("../pages/ReportsPage"),
  "ReportsPage",
);
const { ReportViewerPage } = lazyImport(
  () => import("../pages/ReportViewerPage"),
  "ReportViewerPage",
);

/**
 * `read reports` opens the page; each report also needs `read` on what it
 * shows, which the API applies (its catalog lists only those).
 */
export const ReportRoutes: RouteObject[] = [
  guarded(
    "reports",
    {
      path: RouteConstants.reports.base.path,
      element: <ReportsPage />,
    },
    {
      path: RouteConstants.reports.view.path,
      element: <ReportViewerPage />,
    },
  ),
];
