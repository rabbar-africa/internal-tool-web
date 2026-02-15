import { lazyImport } from "@/utils/lazyImports";
import { Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { RouteError } from "@/components/error/RoutError";
import { AppLayout } from "@/components/layouts";

const { Overview } = lazyImport(
  () => import("../features/overview/pages/Overview"),
  "Overview",
);

export const DashboardRouteList: RouteObject[] = [
  {
    index: true,
    element: <Overview />,
  },
];

const DashboardOutlet = (
  <AppLayout>
    <Outlet />
  </AppLayout>
);
export const DashboardRoutes: RouteObject = {
  path: "/",
  element: DashboardOutlet,
  errorElement: <RouteError />,
  children: [...DashboardRouteList],
};
