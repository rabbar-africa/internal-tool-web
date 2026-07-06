import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { type ApiResponse } from "@/shared/interface/api";
import type {
  CompleteReminderPayload,
  CompleteReminderResponse,
  CreateReminderPayload,
  IGetReminderFilter,
  IGetUpcomingRemindersFilter,
  Reminder,
  UpdateReminderPayload,
} from "@/shared/interface/reminder";

// ── Core CRUD ────────────────────────────────────────────────────────────────

export const getReminders = async (filter?: IGetReminderFilter) => {
  const apiUrl = buildUrlWithQueryParams("/reminders", filter);
  const response = await axios.get<ApiResponse<Reminder[]>>(apiUrl);
  return response.data;
};

/** The panel — next N due within a horizon. Returns a plain array (no meta). */
export const getUpcomingReminders = async (
  filter?: IGetUpcomingRemindersFilter,
) => {
  const apiUrl = buildUrlWithQueryParams("/reminders/upcoming", filter);
  const response = await axios.get<ApiResponse<Reminder[]>>(apiUrl);
  return response.data;
};

export const getReminderById = async (id: string) => {
  const response = await axios.get<ApiResponse<Reminder>>(`/reminders/${id}`);
  return response.data;
};

export const createReminder = async (payload: CreateReminderPayload) => {
  const response = await axios.post<ApiResponse<Reminder>>(
    "/reminders",
    payload,
  );
  return response.data;
};

export const updateReminder = async (
  id: string,
  payload: UpdateReminderPayload,
) => {
  const response = await axios.put<ApiResponse<Reminder>>(
    `/reminders/${id}`,
    payload,
  );
  return response.data;
};

export const deleteReminder = async (id: string): Promise<void> => {
  await axios.delete(`/reminders/${id}`);
};

// ── Lifecycle actions ────────────────────────────────────────────────────────

/** Mark done — auto-schedules the next occurrence if the reminder is recurring. */
export const completeReminder = async (
  id: string,
  payload: CompleteReminderPayload = {},
) => {
  const response = await axios.post<ApiResponse<CompleteReminderResponse>>(
    `/reminders/${id}/complete`,
    payload,
  );
  return response.data;
};

/** Stamp "customer was contacted" (remindedAt). */
export const markReminderReminded = async (id: string) => {
  const response = await axios.patch<ApiResponse<Reminder>>(
    `/reminders/${id}/reminded`,
  );
  return response.data;
};

/** Dismiss (status → DISMISSED). */
export const dismissReminder = async (id: string) => {
  const response = await axios.patch<ApiResponse<Reminder>>(
    `/reminders/${id}/dismiss`,
  );
  return response.data;
};
