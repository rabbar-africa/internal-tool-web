import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { CustomerList } = lazyImport(
  () => import("../pages/CustomerList"),
  "CustomerList",
);
const { CustomerDetailPage } = lazyImport(
  () => import("../pages/CustomerDetailPage"),
  "CustomerDetailPage",
);
const { CreateCustomer } = lazyImport(
  () => import("../pages/CreateCustomer"),
  "CreateCustomer",
);

export const CustomerRoutes: RouteObject[] = [
  {
    path: RouteConstants.customers.base.path,
    element: <CustomerList />,
  },
  {
    path: RouteConstants.customers.create.path,
    element: <CreateCustomer />,
  },
  {
    path: RouteConstants.customers.detail.path,
    element: <CustomerDetailPage />,
  },
];
