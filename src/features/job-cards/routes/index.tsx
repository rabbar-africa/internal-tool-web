import type { RouteObject } from "react-router-dom";
import { guarded } from "@/routes/RequirePermission";
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
  guarded(
    "jobCards",
    {
      path: RouteConstants.jobCards.base.path,
      element: <JobCardListPage />,
    },
    {
      path: RouteConstants.jobCards.detail.path,
      element: <JobCardDetailPage />,
    },
  ),
  guarded("jobCardCreate", {
    path: RouteConstants.jobCards.create.path,
    element: <CreateJobCardPage />,
  }),
  guarded("jobCardEdit", {
    path: RouteConstants.jobCards.edit.path,
    element: <EditJobCardPage />,
  }),
];
