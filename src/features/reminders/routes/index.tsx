import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";

const { ReminderListPage } = lazyImport(
  () => import("../pages/ReminderListPage"),
  "ReminderListPage",
);
const { CreateReminderPage } = lazyImport(
  () => import("../pages/CreateReminderPage"),
  "CreateReminderPage",
);
const { EditReminderPage } = lazyImport(
  () => import("../pages/EditReminderPage"),
  "EditReminderPage",
);
const { ScheduleServicePage } = lazyImport(
  () => import("../pages/ScheduleServicePage"),
  "ScheduleServicePage",
);

export const ReminderRoutes: RouteObject[] = [
  { path: RouteConstants.reminders.base.path, element: <ReminderListPage /> },
  {
    path: RouteConstants.reminders.create.path,
    element: <CreateReminderPage />,
  },
  {
    path: RouteConstants.reminders.scheduleService.path,
    element: <ScheduleServicePage />,
  },
  { path: RouteConstants.reminders.edit.path, element: <EditReminderPage /> },
];
