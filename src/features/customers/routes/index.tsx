import type { RouteObject } from "react-router-dom";
import { guarded } from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { CustomerListPage } = lazyImport(
  () => import("../pages/CustomerListPage"),
  "CustomerListPage",
);
const { CustomerDetailPage } = lazyImport(
  () => import("../pages/CustomerDetailPage"),
  "CustomerDetailPage",
);
const { CreateCustomerPage } = lazyImport(
  () => import("../pages/CreateCustomerPage"),
  "CreateCustomerPage",
);
const { EditCustomerPage } = lazyImport(
  () => import("../pages/EditCustomerPage"),
  "EditCustomerPage",
);

export const CustomerRoutes: RouteObject[] = [
  guarded(
    "customers",
    {
      path: RouteConstants.customers.base.path,
      element: <CustomerListPage />,
    },
    {
      path: RouteConstants.customers.detail.path,
      element: <CustomerDetailPage />,
    },
  ),
  guarded("customerCreate", {
    path: RouteConstants.customers.create.path,
    element: <CreateCustomerPage />,
  }),
  guarded("customerEdit", {
    path: RouteConstants.customers.edit.path,
    element: <EditCustomerPage />,
  }),
];
