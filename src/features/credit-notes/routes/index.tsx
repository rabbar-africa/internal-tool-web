import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";
import { guarded } from "@/routes/RequirePermission";

const { CreditNoteListPage } = lazyImport(
  () => import("../pages/CreditNoteListPage"),
  "CreditNoteListPage",
);
const { CreateCreditNotePage } = lazyImport(
  () => import("../pages/CreateCreditNotePage"),
  "CreateCreditNotePage",
);
const { EditCreditNotePage } = lazyImport(
  () => import("../pages/EditCreditNotePage"),
  "EditCreditNotePage",
);
const { CreditNoteDetailPage } = lazyImport(
  () => import("../pages/CreditNoteDetailPage"),
  "CreditNoteDetailPage",
);

export const CreditNoteRoutes: RouteObject[] = [
  // "create" is listed before ":id" only for reading; React Router ranks
  // static segments above params regardless.
  guarded("creditNoteCreate", {
    path: RouteConstants.creditNotes.create.path,
    element: <CreateCreditNotePage />,
  }),
  guarded(
    "creditNotes",
    {
      path: RouteConstants.creditNotes.base.path,
      element: <CreditNoteListPage />,
    },
    {
      path: RouteConstants.creditNotes.detail.path,
      element: <CreditNoteDetailPage />,
    },
  ),
  guarded("creditNoteEdit", {
    path: RouteConstants.creditNotes.edit.path,
    element: <EditCreditNotePage />,
  }),
];
