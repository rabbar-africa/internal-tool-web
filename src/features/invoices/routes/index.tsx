import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { InvoiceList } = lazyImport(
  () => import("../pages/InvoiceList"),
  "InvoiceList",
);
const { CreateInvoice } = lazyImport(
  () => import("../pages/CreateInvoice"),
  "CreateInvoice",
);
const { InvoiceDetail } = lazyImport(
  () => import("../pages/InvoiceDetail"),
  "InvoiceDetail",
);
const { EditInvoice } = lazyImport(
  () => import("../pages/EditInvoice"),
  "EditInvoice",
);

export const InvoiceRoutes: RouteObject[] = [
  {
    path: RouteConstants.invoices.base.path,
    element: <InvoiceList />,
  },
  {
    path: RouteConstants.invoices.create.path,
    element: <CreateInvoice />,
  },
  {
    path: RouteConstants.invoices.edit.path,
    element: <EditInvoice />,
  },
  {
    path: RouteConstants.invoices.detail.path,
    element: <InvoiceDetail />,
  },
];
