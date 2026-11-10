import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";
import { guarded } from "@/routes/RequirePermission";

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

const { RecordInvoiceCostsPage } = lazyImport(
  () => import("../pages/RecordInvoiceCostsPage"),
  "RecordInvoiceCostsPage",
);

export const InvoiceRoutes: RouteObject[] = [
  guarded(
    "invoices",
    {
      path: RouteConstants.invoices.base.path,
      element: <InvoiceListPage />,
    },
    {
      path: RouteConstants.invoices.detail.path,
      element: <InvoiceDetailPage />,
    },
  ),
  guarded("invoiceCreate", {
    path: RouteConstants.invoices.create.path,
    element: <CreateInvoicePage />,
  }),
  guarded("invoiceEdit", {
    path: RouteConstants.invoices.edit.path,
    element: <EditInvoicePage />,
  }),
  guarded("invoiceCosts", {
    path: RouteConstants.invoices.costs.path,
    element: <RecordInvoiceCostsPage />,
  }),
];
