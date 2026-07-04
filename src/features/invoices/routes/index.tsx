import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { InvoiceListPage } = lazyImport(
  () => import("../pages/InvoiceListPage"),
  "InvoiceListPage",
);
const { CreateInvoicePage } = lazyImport(
  () => import("../pages/CreateInvoicePage"),
  "CreateInvoicePage",
);
const { InvoiceDetailPage } = lazyImport(
  () => import("../pages/InvoiceDetailPage"),
  "InvoiceDetailPage",
);
const { EditInvoicePage } = lazyImport(
  () => import("../pages/EditInvoicePage"),
  "EditInvoicePage",
);

export const InvoiceRoutes: RouteObject[] = [
  {
    path: RouteConstants.invoices.base.path,
    element: <InvoiceListPage />,
  },
  {
    path: RouteConstants.invoices.create.path,
    element: <CreateInvoicePage />,
  },
  {
    path: RouteConstants.invoices.edit.path,
    element: <EditInvoicePage />,
  },
  {
    path: RouteConstants.invoices.detail.path,
    element: <InvoiceDetailPage />,
  },
];
