import { lazyImport } from "@/utils/lazyImports";
import { Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { RouteError } from "@/components/error/RoutError";
import { AppLayout } from "@/components/layouts";
import { InspectionRoutes } from "@/features/inspection/routes";
import { InvoiceRoutes } from "@/features/invoices/routes";
import { PaymentRoutes } from "@/features/payments/routes";
import { CustomerRoutes } from "@/features/customers/routes";
import { ItemRoutes } from "@/features/items/routes";
import { ExpenseRoutes } from "@/features/expenses/routes";
import { ReportRoutes } from "@/features/reports/routes";
import { SettingsRoutes } from "@/features/settings/routes";

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
  children: [
    ...DashboardRouteList,
    ...InspectionRoutes,
    ...InvoiceRoutes,
    ...PaymentRoutes,
    ...CustomerRoutes,
    ...ItemRoutes,
    ...ExpenseRoutes,
    ...ReportRoutes,
    ...SettingsRoutes,
  ],
};
