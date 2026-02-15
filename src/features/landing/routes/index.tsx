import { lazyImport } from "@/utils/lazyImports";
import { Outlet, type RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import { RouteError } from "@/components/error";
const { Home } = lazyImport(() => import("../components/Home"), "Home");

export const LandingPageRouteList: RouteObject[] = [
  {
    index: true,
    element: <Home />,
  },
];

const LandingPageRouteOutlet = (
  <Layout>
    <Outlet />
  </Layout>
);
export const LandingPageRoutes: RouteObject = {
  path: "",
  element: LandingPageRouteOutlet,
  errorElement: <RouteError />,
  children: LandingPageRouteList,
};
