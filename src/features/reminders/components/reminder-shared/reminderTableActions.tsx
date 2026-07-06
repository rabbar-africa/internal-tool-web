import type { TableAction } from "@/components/table";
import type { Reminder } from "@/shared/interface/reminder";
import type { ReminderActionHandlers } from "./useReminderActions";

/** TableAction[] for CustomTable — lifecycle actions disable on non-pending rows. */
export const buildReminderTableActions = (
  handlers: ReminderActionHandlers,
): TableAction<Reminder>[] => {
  const pendingOnly = (r: Reminder) => r.status !== "PENDING";
  return [
    {
      label: "Mark done",
      value: "complete",
      onClick: (r) => handlers.complete(r),
      disabled: pendingOnly,
    },
    {
      label: "Mark reminded",
      value: "reminded",
      onClick: (r) => handlers.markReminded(r),
      disabled: pendingOnly,
    },
    {
      label: "Dismiss",
      value: "dismiss",
      onClick: (r) => handlers.dismiss(r),
      disabled: pendingOnly,
    },
    {
      label: "Edit",
      value: "edit",
      onClick: (r) => handlers.edit(r),
    },
    {
      label: "Delete",
      value: "delete",
      variant: "destructive",
      separator: true,
      onClick: (r) => handlers.remove(r),
    },
  ];
};
