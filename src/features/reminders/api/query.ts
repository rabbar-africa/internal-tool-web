import { useMutation, useQuery, type QueryConfigType } from "@/lib/react-query";
import {
  completeReminder,
  createReminder,
  deleteReminder,
  dismissReminder,
  getReminderById,
  getReminders,
  getUpcomingReminders,
  markReminderReminded,
  updateReminder,
} from "./service";
import type {
  CompleteReminderPayload,
  CreateReminderPayload,
  IGetReminderFilter,
  IGetUpcomingRemindersFilter,
  UpdateReminderPayload,
} from "@/shared/interface/reminder";
import { customQueryKey } from "@/shared/constants/query-keys";

// Any change to a reminder can shift the list, the panel and the open detail,
// so every mutation refreshes all three.
const reminderInvalidations = [
  [customQueryKey.reminders.getAll],
  [customQueryKey.reminders.getById],
  [customQueryKey.reminders.upcoming],
];

// ── Queries ──────────────────────────────────────────────────────────────────

export const useGetRemindersQuery = (
  filter?: IGetReminderFilter,
  config?: QueryConfigType<typeof getReminders>,
) =>
  useQuery({
    queryKey: [customQueryKey.reminders.getAll, filter],
    queryFn: () => getReminders(filter),
    ...config,
  });

export const useGetUpcomingRemindersQuery = (
  filter?: IGetUpcomingRemindersFilter,
  config?: QueryConfigType<typeof getUpcomingReminders>,
) =>
  useQuery({
    queryKey: [customQueryKey.reminders.upcoming, filter],
    queryFn: () => getUpcomingReminders(filter),
    ...config,
  });

export const useGetReminderByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.reminders.getById, id],
    queryFn: () => getReminderById(id),
    enabled: Boolean(id),
  });

// ── Mutations ────────────────────────────────────────────────────────────────

export const useCreateReminderMutation = () =>
  useMutation({
    mutationFn: (payload: CreateReminderPayload) => createReminder(payload),
    meta: {
      successMessage: "Reminder created successfully",
      invalidatesQueryKeys: reminderInvalidations,
    },
  });

export const useUpdateReminderMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateReminderPayload;
    }) => updateReminder(id, payload),
    meta: {
      successMessage: "Reminder updated successfully",
      invalidatesQueryKeys: reminderInvalidations,
    },
  });

export const useCompleteReminderMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: CompleteReminderPayload;
    }) => completeReminder(id, payload),
    meta: {
      successMessage: "Reminder marked as done",
      invalidatesQueryKeys: reminderInvalidations,
    },
  });

export const useMarkReminderRemindedMutation = () =>
  useMutation({
    mutationFn: (id: string) => markReminderReminded(id),
    meta: {
      successMessage: "Marked as reminded",
      invalidatesQueryKeys: reminderInvalidations,
    },
  });

export const useDismissReminderMutation = () =>
  useMutation({
    mutationFn: (id: string) => dismissReminder(id),
    meta: {
      successMessage: "Reminder dismissed",
      invalidatesQueryKeys: reminderInvalidations,
    },
  });

export const useDeleteReminderMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    meta: {
      successMessage: "Reminder deleted",
      invalidatesQueryKeys: reminderInvalidations,
    },
  });
