import type { RouteObject } from "react-router-dom";
import RequirePermission from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { TransferListPage } = lazyImport(
  () => import("../pages/TransferListPage"),
  "TransferListPage",
);

// Transfers (and later statements) show every naira, so the whole branch
// needs `read banking` — the API answers 403 otherwise.
export const BankingRoutes: RouteObject[] = [
  {
    element: <RequirePermission permissions={["read:banking"]} />,
    children: [
      {
        path: RouteConstants.banking.transfers.path,
        element: <TransferListPage />,
      },
    ],
  },
];
