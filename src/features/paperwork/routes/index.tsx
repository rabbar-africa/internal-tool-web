import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { PaperworkPage } = lazyImport(
  () => import("../pages/PaperworkPage"),
  "PaperworkPage",
);

export const PaperworkRoutes: RouteObject[] = [
  {
    path: RouteConstants.paperwork.base.path,
    element: <PaperworkPage />,
  },
];
