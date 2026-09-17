import { AuthRoutes } from "@/features/auth/routes";
import { BillingPublicRoutes } from "@/features/billing/routes";
import { type RouteObject } from "react-router-dom";
import { BaseApp } from "./BaseApp";
import { NotFound, RouteError } from "@/components/error";
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
    // Billing's public pages sit outside ProtectedRoutes: emailed "Pay now"
    // links and Paystack's redirect must work without a login.
    children: [protectedRoutes, AuthRoutes, BillingPublicRoutes],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
