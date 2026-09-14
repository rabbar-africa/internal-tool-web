import { Outlet, type RouteObject } from "react-router-dom";
import { RouteError } from "@/components/error";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";
import { BillingPublicLayout } from "../components/BillingPublicLayout";

const { BillingPage } = lazyImport(
  () => import("../pages/BillingPage"),
  "BillingPage",
);
const { PayLinkPage } = lazyImport(
  () => import("../pages/PayLinkPage"),
  "PayLinkPage",
);
const { PaymentCallbackPage } = lazyImport(
  () => import("../pages/PaymentCallbackPage"),
  "PaymentCallbackPage",
);

/** Settings → Plan & Billing, mounted inside the authenticated app. */
export const BillingSettingsRoutes: RouteObject[] = [
  {
    path: RouteConstants.settings.billing.path,
    element: <BillingPage />,
  },
];

/**
 * Public: emailed "Pay now" links and Paystack's return URL. Mounted outside
 * ProtectedRoutes so they work while logged out.
 */
export const BillingPublicRoutes: RouteObject = {
  path: "billing",
  element: (
    <BillingPublicLayout>
      <Outlet />
    </BillingPublicLayout>
  ),
  errorElement: <RouteError />,
  children: [
    // RouteConstants.billing.pay → /billing/pay/:token
    { path: "pay/:token", element: <PayLinkPage /> },
    // RouteConstants.billing.callback → /billing/callback
    { path: "callback", element: <PaymentCallbackPage /> },
  ],
};
