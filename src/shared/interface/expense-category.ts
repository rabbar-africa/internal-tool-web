/**
 * A business's own expense categories (docs/frontend-expense-categories.md in
 * the backend). Every business starts with ten defaults, can rename and hide
 * them, and can add its own.
 */
export interface IExpenseCategory {
  id: string;
  name: string;
  /** A default's fixed key (`PARTS`, `LABOR`, `OTHER`…); null for the business's own. */
  key: string | null;
  description: string | null;
  /** False = hidden: no longer offered in pickers. */
  isActive: boolean;
  sortOrder: number;
  isDefault: boolean;
  /** What a default was first called, to say "renamed from …". */
  defaultName: string | null;
  usage: { expenses: number; recurringExpenses: number };
  /** Parts, Labour and Other can't be hidden: invoice costs are filed there. */
  canHide: boolean;
  /** Only the business's own, with nothing in it. */
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The category as an expense or recurring expense carries it. */
export interface ExpenseCategoryRef {
  id: string;
  name: string;
  key: string | null;
}

export interface CreateExpenseCategoryPayload {
  name: string;
  description?: string | null;
}

export interface UpdateExpenseCategoryPayload extends Partial<CreateExpenseCategoryPayload> {
  isActive?: boolean;
  sortOrder?: number;
}

export interface DeleteExpenseCategoryResult {
  id: string;
  deleted: true;
  movedTo: { id: string; name: string } | null;
  moved: { expenses: number; recurringExpenses: number };
}

/** The 409s the category routes answer with. */
export type ExpenseCategoryConflict =
  | {
      code: "CATEGORY_EXISTS";
      message: string;
      categoryId?: string;
      hidden?: boolean;
    }
  | { code: "CATEGORY_REQUIRED"; message: string }
  | { code: "DEFAULT_CATEGORY"; message: string }
  | {
      code: "CATEGORY_IN_USE";
      message: string;
      usage?: { expenses: number; recurringExpenses: number };
    }
  | { code: "CATEGORY_MOVE_TO_SELF"; message: string };

/** The category keys the code files expenses under when none is chosen. */
export const CATEGORY_KEY = {
  PARTS: "PARTS",
  LABOR: "LABOR",
  OTHER: "OTHER",
} as const;
