import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import type { Reminder } from "@/shared/interface/reminder";
import {
  useCompleteReminderMutation,
  useDismissReminderMutation,
  useDeleteReminderMutation,
  useMarkReminderRemindedMutation,
} from "../../api/query";
import { CompleteReminderDialog } from "./CompleteReminderDialog";

export interface ReminderActionHandlers {
  edit: (reminder: Reminder) => void;
  complete: (reminder: Reminder) => void;
  markReminded: (reminder: Reminder) => void;
  dismiss: (reminder: Reminder) => void;
  remove: (reminder: Reminder) => void;
}

/**
 * Central home for the row/panel actions (Complete, Mark reminded, Dismiss,
 * Edit, Delete). Returns imperative handlers plus the confirmation dialogs to
 * render once per screen — reused by the table, the panels and the client
 * widget so the behaviour stays identical everywhere.
 */
export function useReminderActions() {
  const navigate = useNavigate();
  const { mutateAsync: complete, isPending: isCompleting } =
    useCompleteReminderMutation();
  const { mutateAsync: markReminded } = useMarkReminderRemindedMutation();
  const { mutateAsync: dismiss, isPending: isDismissing } =
    useDismissReminderMutation();
  const { mutateAsync: remove, isPending: isDeleting } =
    useDeleteReminderMutation();

  const [completeTarget, setCompleteTarget] = useState<Reminder | null>(null);
  const [dismissTarget, setDismissTarget] = useState<Reminder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null);

  const handlers: ReminderActionHandlers = {
    edit: (reminder) =>
      navigate(RouteConstants.reminders.edit.generate({ id: reminder.id })),
    complete: (reminder) => setCompleteTarget(reminder),
    markReminded: (reminder) => markReminded(reminder.id),
    dismiss: (reminder) => setDismissTarget(reminder),
    remove: (reminder) => setDeleteTarget(reminder),
  };

  const dialogs = (
    <>
      <CompleteReminderDialog
        reminder={completeTarget}
        isLoading={isCompleting}
        onCancel={() => setCompleteTarget(null)}
        onConfirm={async (payload) => {
          if (!completeTarget) return;
          await complete({ id: completeTarget.id, payload });
          setCompleteTarget(null);
        }}
      />

      <ConsentDialog
        open={Boolean(dismissTarget)}
        onOpenChange={({ open }) => {
          if (!open) setDismissTarget(null);
        }}
        variant="warning"
        heading={`Dismiss "${dismissTarget?.title ?? ""}"?`}
        note="It will be hidden from the upcoming and overdue lists."
        confirmText="Yes, Dismiss"
        isLoading={isDismissing}
        handleSubmit={async () => {
          if (!dismissTarget) return;
          await dismiss(dismissTarget.id);
          setDismissTarget(null);
        }}
      />

      <ConsentDialog
        open={Boolean(deleteTarget)}
        onOpenChange={({ open }) => {
          if (!open) setDeleteTarget(null);
        }}
        heading={`Delete "${deleteTarget?.title ?? ""}"?`}
        note="This permanently removes the reminder."
        isLoading={isDeleting}
        handleSubmit={async () => {
          if (!deleteTarget) return;
          await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </>
  );

  return { handlers, dialogs };
}
