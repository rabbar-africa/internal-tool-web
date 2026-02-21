import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { Settings } = lazyImport(() => import("../pages/Settings"), "Settings");

export const SettingsRoutes: RouteObject[] = [
  {
    path: RouteConstants.settings.base.path,
    element: <Settings />,
  },
];
