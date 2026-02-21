import type { Expense, CreateExpensePayload } from "@/shared/interface/expense";
import { MOCK_EXPENSES } from "@/shared/data/mock";

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const getExpenses = async (): Promise<Expense[]> => {
  await delay(300);
  return MOCK_EXPENSES;
};

export const createExpense = async (
  payload: CreateExpensePayload,
): Promise<Expense> => {
  await delay(500);
  return {
    id: `exp-${Date.now()}`,
    expenseNumber: `EXP-2025-${String(MOCK_EXPENSES.length + 1).padStart(3, "0")}`,
    ...payload,
    status: "pending",
    addedBy: "Current User",
    createdAt: new Date().toISOString().split("T")[0],
  };
};
