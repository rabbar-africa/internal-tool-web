import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Portal,
  Stack,
  Switch,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "@/assets/custom/PlusIcon";
import { ActionButton } from "@/components/common/ActionButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTable, type TableAction } from "@/components/table";
import { usePermissions } from "@/hooks/usePermissions";
import type { IExpenseCategory } from "@/shared/interface/expense-category";
import {
  useDeleteExpenseCategoryMutation,
  useExpenseCategories,
  useUpdateExpenseCategoryMutation,
} from "@/features/expense-categories/api";
import { ExpenseCategoryModal } from "@/features/expense-categories/components";
import {
  categoryConflictOf,
  describeUsage,
} from "@/features/expense-categories/utils/conflict";
import { SettingsSubPage } from "../SettingsSubPage";

const usageCount = (category: IExpenseCategory) =>
  category.usage.expenses + category.usage.recurringExpenses;

const CANT_HIDE =
  "Costs for invoice items are filed here, so it can't be hidden. You can rename it.";

/** The show/hide switch, explained when it can't be turned off. */
function ShownSwitch({
  category,
  mayUpdate,
}: {
  category: IExpenseCategory;
  mayUpdate: boolean;
}) {
  const { mutate: update, isPending } = useUpdateExpenseCategoryMutation();
  const locked = !category.canHide && category.isActive;
  const control = (
    <Switch.Root
      size="sm"
      checked={category.isActive}
      disabled={!mayUpdate || locked || isPending}
      onCheckedChange={(e) =>
        update({ id: category.id, payload: { isActive: e.checked } })
      }
    >
      <Switch.HiddenInput />
      <Switch.Control _checked={{ bg: "primary.300" }}>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label fontSize="13px" color="gray.400">
        {category.isActive ? "Shown" : "Hidden"}
      </Switch.Label>
    </Switch.Root>
  );
  if (!locked) return control;
  return (
    <Tooltip.Root openDelay={200}>
      <Tooltip.Trigger asChild>
        <Box display="inline-flex">{control}</Box>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content p=".75rem" maxW="18rem">
            {CANT_HIDE}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}

/** Settings → Expense categories: the business's own list. */
export function ExpenseCategories() {
  const { categories, isLoading } = useExpenseCategories({
    includeHidden: true,
  });
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const mayCreate = canCreate("expense_categories");
  const mayUpdate = canUpdate("expense_categories");
  const mayDelete = canDelete("expense_categories");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IExpenseCategory | null>(null);
  const [deleting, setDeleting] = useState<IExpenseCategory | null>(null);
  // Set when it has expenses (known up front, or the API said so).
  const [mustMove, setMustMove] = useState(false);
  const [moveTo, setMoveTo] = useState("");
  const [moveError, setMoveError] = useState<string | null>(null);

  const { mutate: remove, isPending: isDeleting } =
    useDeleteExpenseCategoryMutation();
  const { mutate: update, isPending: isHiding } =
    useUpdateExpenseCategoryMutation();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openDelete = (category: IExpenseCategory) => {
    setDeleting(category);
    setMustMove(!category.canDelete && usageCount(category) > 0);
    setMoveTo("");
    setMoveError(null);
  };
  const closeDelete = () => setDeleting(null);

  const confirmDelete = () => {
    if (!deleting) return;
    if (mustMove && !moveTo) {
      setMoveError("Choose where its expenses should go");
      return;
    }
    remove(
      { id: deleting.id, ...(mustMove ? { moveTo } : {}) },
      {
        onSuccess: closeDelete,
        onError: (error) => {
          // Something was filed under it since the list loaded.
          if (categoryConflictOf(error)?.code === "CATEGORY_IN_USE") {
            setMustMove(true);
          }
        },
      },
    );
  };

  const hideInstead = () => {
    if (!deleting) return;
    update(
      { id: deleting.id, payload: { isActive: false } },
      { onSuccess: closeDelete },
    );
  };

  const moveOptions = useMemo(
    () =>
      categories
        .filter((c) => c.id !== deleting?.id)
        .map((c) => ({
          label: c.isActive ? c.name : `${c.name} (hidden)`,
          value: c.id,
        })),
    [categories, deleting?.id],
  );

  const columns = useMemo<ColumnDef<IExpenseCategory>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const category = row.original;
          const renamedFrom =
            category.isDefault &&
            category.defaultName &&
            category.defaultName !== category.name
              ? category.defaultName
              : null;
          return (
            <Box maxW="20rem">
              <Flex align="center" gap="2" wrap="wrap">
                <Text
                  textStyle="small-regular"
                  color={category.isActive ? "gray.500" : "gray.300"}
                  fontWeight="500"
                >
                  {category.name}
                </Text>
                {category.isDefault && (
                  <Badge size="sm" variant="subtle" colorPalette="gray">
                    Default
                  </Badge>
                )}
              </Flex>
              {renamedFrom && (
                <Text fontSize="11px" color="gray.300">
                  Renamed from {renamedFrom}
                </Text>
              )}
            </Box>
          );
        },
      },
      {
        id: "description",
        header: "Description",
        cell: ({ row }) => (
          <Text textStyle="small-regular" color="gray.400" maxW="22rem">
            {row.original.description || "—"}
          </Text>
        ),
      },
      {
        id: "usage",
        header: "Used",
        cell: ({ row }) => {
          const { usage } = row.original;
          return (
            <Text textStyle="small-regular" color="gray.500">
              {usage.expenses}
              {usage.recurringExpenses ? (
                <Text as="span" fontSize="11px" color="gray.300">
                  {" "}
                  + {usage.recurringExpenses} recurring
                </Text>
              ) : null}
            </Text>
          );
        },
      },
      {
        id: "shown",
        header: "Show in pickers",
        cell: ({ row }) => (
          <ShownSwitch category={row.original} mayUpdate={mayUpdate} />
        ),
        meta: { disableRowClick: true },
      },
    ],
    [mayUpdate],
  );

  const actions: TableAction<IExpenseCategory>[] = [
    {
      label: "Rename",
      value: "rename",
      hidden: () => !mayUpdate,
      onClick: (category) => {
        setEditing(category);
        setModalOpen(true);
      },
    },
    {
      label: "Delete",
      value: "delete",
      variant: "destructive",
      // The ten defaults stay: hide one instead.
      hidden: (category) => category.isDefault || !mayDelete,
      onClick: openDelete,
    },
  ];

  return (
    <SettingsSubPage
      title="Expense categories"
      subtitle="The categories you file expenses under. Rename them, hide ones you don't use, or add your own."
      action={
        mayCreate ? (
          <ActionButton
            icon={PlusIcon}
            text="Add category"
            size="sm"
            onClick={openCreate}
            iconProps={{ boxSize: "1rem" }}
          />
        ) : undefined
      }
    >
      <Box overflowX="auto" minW={0}>
        <CustomTable
          data={categories}
          columns={columns}
          loading={isLoading}
          enableActions={mayUpdate || mayDelete}
          actions={actions}
          NoDataText="No categories yet."
        />
      </Box>

      <ExpenseCategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editing}
      />

      <ConsentDialog
        open={Boolean(deleting)}
        onOpenChange={({ open }) => {
          if (!open) closeDelete();
        }}
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
        heading={`Delete ${deleting?.name ?? "this category"}?`}
        confirmText={mustMove ? "Move and delete" : "Yes, Delete"}
        note={
          deleting
            ? mustMove
              ? `It has ${describeUsage(deleting.usage)}. Move them to another category first, or hide it instead.`
              : "Nothing is filed under it, so nothing else changes."
            : undefined
        }
      >
        {deleting && mustMove ? (
          <Stack gap="3">
            <CustomSelect
              label={`Move ${describeUsage(deleting.usage)} to`}
              placeholder="Select category..."
              options={moveOptions}
              value={moveTo ? [moveTo] : []}
              error={moveError ?? undefined}
              onChange={(opt: { value: string[] } | null) => {
                setMoveTo(opt?.value?.[0] ?? "");
                setMoveError(null);
              }}
            />
            {deleting.isActive && mayUpdate && (
              <Button
                size="xs"
                variant="ghost"
                color="gray.400"
                alignSelf="flex-start"
                px="1"
                loading={isHiding}
                onClick={hideInstead}
              >
                Hide it instead
              </Button>
            )}
          </Stack>
        ) : null}
      </ConsentDialog>
    </SettingsSubPage>
  );
}
