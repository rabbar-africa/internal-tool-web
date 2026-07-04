import type { RouteObject } from "react-router-dom";
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
const { EditExpensePage } = lazyImport(
  () => import("../pages/EditExpensePage"),
  "EditExpensePage",
);

export const ExpenseRoutes: RouteObject[] = [
  {
    path: RouteConstants.expenses.base.path,
    element: <ExpenseListPage />,
  },
  {
    path: RouteConstants.expenses.create.path,
    element: <CreateExpensePage />,
  },
  {
    path: RouteConstants.expenses.edit.path,
    element: <EditExpensePage />,
  },
];
