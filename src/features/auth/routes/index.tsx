import { lazyImport } from "@/utils/lazyImports";
import { Outlet, type RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import { RouteError } from "@/components/error";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute";

const { Login } = lazyImport(() => import("../components/Login"), "Login");
const { Signup } = lazyImport(() => import("../components/Signup"), "Signup");
const { ResetPassword } = lazyImport(
  () => import("../components/ResetPassword"),
  "ResetPassword",
);
const { AcceptInvite } = lazyImport(
  () => import("../components/AcceptInvite"),
  "AcceptInvite",
);

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
  // Both paths render the same two-phase (email → OTP + new password) flow.
  {
    path: "reset-password",
    element: (
      <PublicOnlyRoute>
        <ResetPassword />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "forgot-password",
    element: (
      <PublicOnlyRoute>
        <ResetPassword />
      </PublicOnlyRoute>
    ),
  },
  // Linked from the invitation email as /auth/accept-invite?token=…
  // Not public-only: someone signed in (often the admin who sent it, testing
  // it) was sent to the dashboard with no word (QA bug #13). The page itself
  // says who is signed in and offers to sign out.
  {
    path: "accept-invite",
    element: <AcceptInvite />,
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
