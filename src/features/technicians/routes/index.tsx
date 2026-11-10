import type { RouteObject } from "react-router-dom";
import { guarded } from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { TechnicianListPage } = lazyImport(
  () => import("../pages/TechnicianListPage"),
  "TechnicianListPage",
);

export const TechnicianRoutes: RouteObject[] = [
  guarded("technicians", {
    path: RouteConstants.technicians.base.path,
    element: <TechnicianListPage />,
  }),
];
