export type ExpenseCategory =
  | "parts"
  | "labour"
  | "overhead"
  | "utilities"
  | "marketing"
  | "transport"
  | "other";

export type ExpenseStatus = "pending" | "approved" | "rejected";

export interface Expense {
  id: string;
  expenseNumber: string;
  title: string;
  category: ExpenseCategory;
  vendor?: string;
  amount: number;
  expenseDate: string;
  linkedInvoiceId?: string;
  linkedInvoiceNumber?: string;
  status: ExpenseStatus;
  addedBy: string;
  notes?: string;
  createdAt: string;
}

export interface CreateExpensePayload {
  title: string;
  category: ExpenseCategory;
  vendor?: string;
  amount: number;
  expenseDate: string;
  linkedInvoiceId?: string;
  notes?: string;
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  parts: "Parts & Materials",
  labour: "Labour",
  overhead: "Overhead",
  utilities: "Utilities",
  marketing: "Marketing",
  transport: "Transport",
  other: "Other",
};
