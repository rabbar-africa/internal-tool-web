import type { RouteObject } from "react-router-dom";
import RequirePermission from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { BankingPage } = lazyImport(
  () => import("../pages/BankingPage"),
  "BankingPage",
);
const { TransferListPage } = lazyImport(
  () => import("../pages/TransferListPage"),
  "TransferListPage",
);
const { StatementPage } = lazyImport(
  () => import("../pages/StatementPage"),
  "StatementPage",
);

// Transfers and statements show every naira, so the whole branch
// needs `read banking` — the API answers 403 otherwise.
export const BankingRoutes: RouteObject[] = [
  {
    element: <RequirePermission permissions={["read:banking"]} />,
    children: [
      // Statements are the everyday screen; transfers stay reachable from a
      // statement's transfer lines, to correct one.
      {
        path: RouteConstants.banking.base.path,
        element: <BankingPage />,
      },
      {
        path: RouteConstants.banking.transfers.path,
        element: <TransferListPage />,
      },
      {
        path: RouteConstants.banking.statement.path,
        element: <StatementPage />,
      },
    ],
  },
];
