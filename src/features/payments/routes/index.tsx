import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { PaymentList } = lazyImport(
  () => import("../pages/PaymentList"),
  "PaymentList",
);
const { CreatePaymentPage } = lazyImport(
  () => import("../pages/CreatePaymentPage"),
  "CreatePaymentPage",
);

export const PaymentRoutes: RouteObject[] = [
  {
    path: RouteConstants.payments.base.path,
    element: <PaymentList />,
  },
  {
    path: RouteConstants.payments.create.path,
    element: <CreatePaymentPage />,
  },
];
