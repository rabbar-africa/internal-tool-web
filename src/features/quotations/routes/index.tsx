import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";
import { guarded } from "@/routes/RequirePermission";

const { QuotationListPage } = lazyImport(
  () => import("../pages/QuotationListPage"),
  "QuotationListPage",
);
const { CreateQuotationPage } = lazyImport(
  () => import("../pages/CreateQuotationPage"),
  "CreateQuotationPage",
);
const { EditQuotationPage } = lazyImport(
  () => import("../pages/EditQuotationPage"),
  "EditQuotationPage",
);
const { QuotationDetailPage } = lazyImport(
  () => import("../pages/QuotationDetailPage"),
  "QuotationDetailPage",
);

export const QuotationRoutes: RouteObject[] = [
  guarded(
    "quotations",
    {
      path: RouteConstants.quotations.base.path,
      element: <QuotationListPage />,
    },
    {
      path: RouteConstants.quotations.detail.path,
      element: <QuotationDetailPage />,
    },
  ),
  guarded("quotationCreate", {
    path: RouteConstants.quotations.create.path,
    element: <CreateQuotationPage />,
  }),
  guarded("quotationEdit", {
    path: RouteConstants.quotations.edit.path,
    element: <EditQuotationPage />,
  }),
];
