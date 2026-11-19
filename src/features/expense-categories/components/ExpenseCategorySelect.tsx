import { useMemo, useState } from "react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { usePermissions } from "@/hooks/usePermissions";
import type { CustomSelectProps } from "@/shared/interface/input";
import type { IExpenseCategory } from "@/shared/interface/expense-category";
import { useExpenseCategories } from "../api";
import { ExpenseCategoryModal } from "./ExpenseCategoryModal";

/** The picker row that opens "New category" instead of choosing. */
const NEW_CATEGORY = "__new_category__";

interface ExpenseCategorySelectProps extends Pick<
  CustomSelectProps,
  "rootProps" | "controlProps" | "error"
> {
  label?: string;
  /** The chosen category's id; "" = none chosen yet. */
  value: string;
  onChange: (id: string) => void;
  /** The record's own category: still offered when hidden, so an edit keeps it. */
  keepId?: string | null;
  /**
   * Shown as chosen while nothing is: the category the API files it under
   * when none is sent (`PARTS` for an expense, `OTHER` for a recurring one).
   */
  fallbackKey?: string;
  /** Offer "+ New category" at the bottom, to those who may add one. */
  allowCreate?: boolean;
}

/**
 * The business's expense categories as a picker. Only shown ones are offered,
 * plus the record's own; value is the category id.
 */
export function ExpenseCategorySelect({
  label = "Category",
  value,
  onChange,
  keepId,
  fallbackKey,
  allowCreate = false,
  ...selectProps
}: ExpenseCategorySelectProps) {
  // One cached list for every picker and the settings page; hidden ones are
  // dropped here so a record's own hidden category can still be named.
  const { categories, isLoading } = useExpenseCategories({
    includeHidden: true,
  });
  const mayCreate = usePermissions().canCreate("expense_categories");
  const [modalOpen, setModalOpen] = useState(false);
  // Just added: offered before the refreshed list arrives.
  const [added, setAdded] = useState<IExpenseCategory | null>(null);

  const shown =
    value || categories.find((c) => c.key === fallbackKey)?.id || "";

  const options = useMemo(() => {
    const list = categories
      .filter((c) => c.isActive || c.id === keepId || c.id === value)
      .map((c) => ({
        label: c.isActive ? c.name : `${c.name} (hidden)`,
        value: c.id,
      }));
    if (added && !list.some((option) => option.value === added.id)) {
      list.push({ label: added.name, value: added.id });
    }
    if (allowCreate && mayCreate) {
      list.push({ label: "+ New category", value: NEW_CATEGORY });
    }
    return list;
  }, [categories, keepId, value, added, allowCreate, mayCreate]);

  return (
    <>
      <CustomSelect
        label={label}
        placeholder="Select category..."
        options={options}
        loading={isLoading}
        value={shown ? [shown] : []}
        onChange={(opt: { value: string[] } | null) => {
          const id = opt?.value?.[0] ?? "";
          if (id === NEW_CATEGORY) {
            setModalOpen(true);
            return;
          }
          onChange(id);
        }}
        {...selectProps}
      />
      {allowCreate && mayCreate && (
        <ExpenseCategoryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={(category) => {
            setAdded(category);
            onChange(category.id);
          }}
        />
      )}
    </>
  );
}

/**
 * Options for a list filter: every category, hidden ones too (their old
 * expenses can still be looked up), value = id.
 */
export function useExpenseCategoryFilterOptions() {
  const { categories } = useExpenseCategories({ includeHidden: true });
  return useMemo(
    () =>
      categories.map((c) => ({
        label: c.isActive ? c.name : `${c.name} (hidden)`,
        value: c.id,
      })),
    [categories],
  );
}
