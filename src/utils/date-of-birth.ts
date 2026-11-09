import moment from "moment";
import * as Yup from "yup";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Today as YYYY-MM-DD, the latest a date of birth can be. */
export const todayIso = () => moment().format("YYYY-MM-DD");

/**
 * Optional; YYYY-MM-DD, a real day, not in the future, as the API checks.
 * A saved value left as it is passes, even one from before that rule.
 */
export const dobField = (saved?: string | null) =>
  Yup.string().test(
    "dob",
    "Enter a real date of birth that isn't in the future",
    (value) => {
      if (!value || value === (saved ?? "")) return true;
      const day = moment(value, "YYYY-MM-DD", true);
      return (
        ISO_DAY.test(value) && day.isValid() && !day.isAfter(moment(), "day")
      );
    },
  );

/**
 * What to send on an update: nothing when unchanged (so an old value that a
 * date input can't show isn't wiped), null to clear it, or the new day.
 */
export const dobForUpdate = (value: string, saved?: string | null) => {
  if (value === (saved ?? "")) return {};
  return { dob: value || null };
};

/** "25 December 1990", or the saved text when it isn't a date. */
export function formatDob(dob?: string | null) {
  if (!dob) return "";
  const day = moment(dob, "YYYY-MM-DD", true);
  return day.isValid() ? day.format("D MMMM YYYY") : dob;
}
