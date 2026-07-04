import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { ItemListPage } = lazyImport(
  () => import("../pages/ItemListPage"),
  "ItemListPage",
);
const { CreateItemPage } = lazyImport(
  () => import("../pages/CreateItemPage"),
  "CreateItemPage",
);

export const ItemRoutes: RouteObject[] = [
  {
    path: RouteConstants.items.base.path,
    element: <ItemListPage />,
  },
  {
    path: RouteConstants.items.create.path,
    element: <CreateItemPage />,
  },
];
