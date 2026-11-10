import type { RouteObject } from "react-router-dom";
import { guarded } from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { PaperworkPage } = lazyImport(
  () => import("../pages/PaperworkPage"),
  "PaperworkPage",
);

export const PaperworkRoutes: RouteObject[] = [
  guarded("paperwork", {
    path: RouteConstants.paperwork.base.path,
    element: <PaperworkPage />,
  }),
];
