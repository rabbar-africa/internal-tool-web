import { lazyImport } from "@/utils/lazyImports";
import { Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { RouteError } from "@/components/error/RoutError";
import { AppLayout } from "@/components/layouts";
import { InspectionRoutes } from "@/features/inspection/routes";
import { InvoiceRoutes } from "@/features/invoices/routes";
import { PaymentRoutes } from "@/features/payments/routes";
import { CustomerRoutes } from "@/features/customers/routes";
import { PaperworkRoutes } from "@/features/paperwork/routes";
import { ItemRoutes } from "@/features/items/routes";
import { ExpenseRoutes } from "@/features/expenses/routes";
import { JobCardRoutes } from "@/features/job-cards/routes";
import { TechnicianRoutes } from "@/features/technicians/routes";
import { ReportRoutes } from "@/features/reports/routes";
import { SettingsRoutes } from "@/features/settings/routes";

const { OverviewPage } = lazyImport(
  () => import("../features/overview/pages/OverviewPage"),
  "OverviewPage",
);

export const DashboardRouteList: RouteObject[] = [
  {
    index: true,
    element: <OverviewPage />,
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
    ...PaperworkRoutes,
    ...ItemRoutes,
    ...ExpenseRoutes,
    ...JobCardRoutes,
    ...TechnicianRoutes,
    ...ReportRoutes,
    ...SettingsRoutes,
  ],
};
