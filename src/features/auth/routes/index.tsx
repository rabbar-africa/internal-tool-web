import { lazyImport } from "@/utils/lazyImports";
import { Outlet, type RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import { RouteError } from "@/components/error";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute";

const { Login } = lazyImport(() => import("../components/Login"), "Login");
const { Signup } = lazyImport(() => import("../components/Signup"), "Signup");

export const AuthRouteList: RouteObject[] = [
  {
    path: "login",
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "signup",
    element: (
      <PublicOnlyRoute>
        <Signup />
      </PublicOnlyRoute>
    ),
  },
];

const LandingPagesRouteOutlet = (
  <Layout>
    <Outlet />
  </Layout>
);
export const AuthRoutes: RouteObject = {
  path: "auth",
  element: LandingPagesRouteOutlet,
  errorElement: <RouteError />,
  children: AuthRouteList,
};
