import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { PaymentList } = lazyImport(
  () => import("../pages/PaymentList"),
  "PaymentList",
);
const { CreatePayment } = lazyImport(
  () => import("../pages/CreatePayment"),
  "CreatePayment",
);

export const PaymentRoutes: RouteObject[] = [
  {
    path: RouteConstants.payments.base.path,
    element: <PaymentList />,
  },
  {
    path: RouteConstants.payments.create.path,
    element: <CreatePayment />,
  },
];
