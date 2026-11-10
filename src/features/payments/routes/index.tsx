import type { RouteObject } from "react-router-dom";
import { guarded } from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { PaymentListPage } = lazyImport(
  () => import("../pages/PaymentListPage"),
  "PaymentListPage",
);
const { CreatePaymentPage } = lazyImport(
  () => import("../pages/CreatePaymentPage"),
  "CreatePaymentPage",
);
const { PaymentDetailPage } = lazyImport(
  () => import("../pages/PaymentDetailPage"),
  "PaymentDetailPage",
);

export const PaymentRoutes: RouteObject[] = [
  guarded(
    "payments",
    {
      path: RouteConstants.payments.base.path,
      element: <PaymentListPage />,
    },
    {
      path: RouteConstants.payments.detail.path,
      element: <PaymentDetailPage />,
    },
  ),
  guarded("paymentCreate", {
    path: RouteConstants.payments.create.path,
    element: <CreatePaymentPage />,
  }),
];
