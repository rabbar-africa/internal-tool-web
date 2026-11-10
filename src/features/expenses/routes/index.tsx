import type { RouteObject } from "react-router-dom";
import { guarded } from "@/routes/RequirePermission";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { ExpenseListPage } = lazyImport(
  () => import("../pages/ExpenseListPage"),
  "ExpenseListPage",
);
const { CreateExpensePage } = lazyImport(
  () => import("../pages/CreateExpensePage"),
  "CreateExpensePage",
);
const { BulkExpensePage } = lazyImport(
  () => import("../pages/BulkExpensePage"),
  "BulkExpensePage",
);
const { EditExpensePage } = lazyImport(
  () => import("../pages/EditExpensePage"),
  "EditExpensePage",
);

export const ExpenseRoutes: RouteObject[] = [
  guarded("expenses", {
    path: RouteConstants.expenses.base.path,
    element: <ExpenseListPage />,
  }),
  guarded(
    "expenseCreate",
    {
      path: RouteConstants.expenses.create.path,
      element: <CreateExpensePage />,
    },
    {
      path: RouteConstants.expenses.bulk.path,
      element: <BulkExpensePage />,
    },
  ),
  guarded("expenseEdit", {
    path: RouteConstants.expenses.edit.path,
    element: <EditExpensePage />,
  }),
];
