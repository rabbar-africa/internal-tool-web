import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";
import RequirePermission from "@/routes/RequirePermission";

const { RecurringExpenseListPage } = lazyImport(
  () => import("../pages/RecurringExpenseListPage"),
  "RecurringExpenseListPage",
);
const { CreateRecurringExpensePage } = lazyImport(
  () => import("../pages/CreateRecurringExpensePage"),
  "CreateRecurringExpensePage",
);
const { EditRecurringExpensePage } = lazyImport(
  () => import("../pages/EditRecurringExpensePage"),
  "EditRecurringExpensePage",
);
const { RecurringExpenseDetailPage } = lazyImport(
  () => import("../pages/RecurringExpenseDetailPage"),
  "RecurringExpenseDetailPage",
);

/** Expenses → Recurring. Permissions are the expenses' own. */
export const RecurringExpenseRoutes: RouteObject[] = [
  {
    element: <RequirePermission permissions={["read:expenses"]} />,
    children: [
      {
        path: RouteConstants.expenses.recurring.path,
        element: <RecurringExpenseListPage />,
      },
      {
        path: RouteConstants.expenses.recurringDetail.path,
        element: <RecurringExpenseDetailPage />,
      },
    ],
  },
  {
    element: <RequirePermission permissions={["create:expenses"]} />,
    children: [
      {
        path: RouteConstants.expenses.recurringCreate.path,
        element: <CreateRecurringExpensePage />,
      },
    ],
  },
  {
    element: <RequirePermission permissions={["update:expenses"]} />,
    children: [
      {
        path: RouteConstants.expenses.recurringEdit.path,
        element: <EditRecurringExpensePage />,
      },
    ],
  },
];
