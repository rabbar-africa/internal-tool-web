import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { JobCardListPage } = lazyImport(
  () => import("../pages/JobCardListPage"),
  "JobCardListPage",
);
const { CreateJobCardPage } = lazyImport(
  () => import("../pages/CreateJobCardPage"),
  "CreateJobCardPage",
);
const { EditJobCardPage } = lazyImport(
  () => import("../pages/EditJobCardPage"),
  "EditJobCardPage",
);
const { JobCardDetailPage } = lazyImport(
  () => import("../pages/JobCardDetailPage"),
  "JobCardDetailPage",
);

export const JobCardRoutes: RouteObject[] = [
  {
    path: RouteConstants.jobCards.base.path,
    element: <JobCardListPage />,
  },
  {
    path: RouteConstants.jobCards.create.path,
    element: <CreateJobCardPage />,
  },
  {
    path: RouteConstants.jobCards.edit.path,
    element: <EditJobCardPage />,
  },
  {
    path: RouteConstants.jobCards.detail.path,
    element: <JobCardDetailPage />,
  },
];
