import moment from "moment";
import type { BusinessDeletionCounts } from "@/shared/interface/settings";

/** What the owner is told before deleting, as the backend asks. */
export const deletionNotice = (graceDays: number) =>
  `Deleting your business removes your team's accounts, customers, vehicles, invoices, payments, expenses, job cards and inspections. It happens ${graceDays} days after you confirm, and you can cancel until then. We keep a record of what you paid Rabbar, with no personal details, because tax law requires it.`;

/** "21 November 2026". */
export const formatDeletionDate = (date: string) =>
  moment(date).format("D MMMM YYYY");

const COUNT_LABELS: Array<[keyof BusinessDeletionCounts, string, string]> = [
  ["users", "team account", "team accounts"],
  ["customers", "customer", "customers"],
  ["vehicles", "vehicle", "vehicles"],
  ["invoices", "invoice", "invoices"],
  ["paymentsReceived", "payment", "payments"],
  ["expenses", "expense", "expenses"],
  ["jobCards", "job card", "job cards"],
  ["inspections", "inspection", "inspections"],
];

/** "47 customers, 149 invoices, …", leaving out what there's none of. */
export const describeCounts = (counts: BusinessDeletionCounts) =>
  COUNT_LABELS.filter(([key]) => counts[key] > 0)
    .map(([key, one, many]) => {
      const n = counts[key];
      return `${n.toLocaleString()} ${n === 1 ? one : many}`;
    })
    .join(", ");

/** The same leniency the server allows: case and spacing don't matter. */
export const sameName = (a: string, b: string) => {
  const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  return normalize(a) === normalize(b);
};
