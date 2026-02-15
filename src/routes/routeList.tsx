import { AuthRoutes } from "@/features/auth/routes";
import { type RouteObject } from "react-router-dom";
import { BaseApp } from "./BaseApp";
import { RouteError } from "@/components/error";
import ProtectedRoutes from "./ProtectedRoutes";
import { DashboardRoutes } from "./DashboardRoutes";

const protectedRoutes: RouteObject = {
  path: "/",
  element: <ProtectedRoutes />,
  children: [DashboardRoutes],
  errorElement: <RouteError />,
};

export const RoutesList: RouteObject[] = [
  {
    path: "",
    element: <BaseApp />,
    errorElement: <RouteError />,
    children: [protectedRoutes, AuthRoutes],
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  },
];
