import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { TechnicianListPage } = lazyImport(
  () => import("../pages/TechnicianListPage"),
  "TechnicianListPage",
);

export const TechnicianRoutes: RouteObject[] = [
  {
    path: RouteConstants.technicians.base.path,
    element: <TechnicianListPage />,
  },
];
