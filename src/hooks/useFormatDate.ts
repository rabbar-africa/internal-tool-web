import { useCallback } from "react";
import moment from "moment";
import { useCurrentUser } from "./useCurrentUser";

const DEFAULT_FORMAT = "DD MMM YYYY";

// Pure formatter — safe to call outside React.
export function formatDate(
  date: string | Date | number | null | undefined,
  format: string = DEFAULT_FORMAT,
): string {
  if (date === null || date === undefined || date === "") return "—";
  const m = moment(date);
  return m.isValid() ? m.format(format) : "—";
}

export function useFormatDate() {
  const { userOrganization } = useCurrentUser();
  const timezone = userOrganization?.timezone;

  const bound = useCallback(
    (date: Parameters<typeof formatDate>[0], format?: string) =>
      formatDate(date, format),
    [],
  );

  return { formatDate: bound, timezone };
}
