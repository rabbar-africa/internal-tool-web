import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { ExpenseList } = lazyImport(
  () => import("../pages/ExpenseList"),
  "ExpenseList",
);
const { CreateExpense } = lazyImport(
  () => import("../pages/CreateExpense"),
  "CreateExpense",
);

export const ExpenseRoutes: RouteObject[] = [
  {
    path: RouteConstants.expenses.base.path,
    element: <ExpenseList />,
  },
  {
    path: RouteConstants.expenses.create.path,
    element: <CreateExpense />,
  },
];
