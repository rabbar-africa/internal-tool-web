import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { ItemList } = lazyImport(() => import("../pages/ItemList"), "ItemList");
const { CreateItem } = lazyImport(
  () => import("../pages/CreateItem"),
  "CreateItem",
);

export const ItemRoutes: RouteObject[] = [
  {
    path: RouteConstants.items.base.path,
    element: <ItemList />,
  },
  {
    path: RouteConstants.items.create.path,
    element: <CreateItem />,
  },
];
