import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { Reports } = lazyImport(() => import("../pages/Reports"), "Reports");

export const ReportRoutes: RouteObject[] = [
  {
    path: RouteConstants.reports.base.path,
    element: <Reports />,
  },
];
