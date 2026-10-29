import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { TrashIcon } from "@/assets/custom/TrashIcon";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import { PaymentModeDto } from "@/shared/interface/payment";
import {
  EXPENSE_CATEGORY_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  type CreateExpensePayload,
  type ExpenseCategory,
} from "@/shared/interface/expense";
import { AccountSelect } from "@/features/settings/components/account-details/AccountSelect";
import { useGetJobCardsQuery } from "@/features/job-cards/api/query";
import { getErrorMessage } from "@/utils/handle-error";
import { useCreateExpensesBulkMutation } from "../api/query";

/** The API takes up to 100 expenses per save. */
const MAX_ROWS = 100;

interface BulkRow {
  key: number;
  name: string;
  category: ExpenseCategory;
  quantity: string;
  unitCost: string;
}

const toNum = (v: string) => Number(v) || 0;
const rowTotal = (row: BulkRow) => toNum(row.quantity) * toNum(row.unitCost);
const isBlank = (row: BulkRow) => !row.name.trim() && !toNum(row.unitCost);

/**
 * Several expenses at once — a day's receipts, a supplier's invoice. The date,
 * payment and job card are shared; each row is one expense. Saved all
 * together or not at all.
 */
export function BulkExpenseTemplate() {
  const navigate = useNavigate();
  const { formatMoney } = useFormatMoney();
  const { mutateAsync: createMany, isPending } =
    useCreateExpensesBulkMutation();

  const nextKey = useRef(1);
  const newRow = (): BulkRow => ({
    key: nextKey.current++,
    name: "",
    category: "PARTS",
    quantity: "1",
    unitCost: "",
  });
  const [rows, setRows] = useState<BulkRow[]>(() => [
    newRow(),
    newRow(),
    newRow(),
  ]);

  // Shared by every row.
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [paymentMode, setPaymentMode] = useState<PaymentModeDto | "">("");
  const [accountId, setAccountId] = useState("");
  const accountPickedRef = useRef(false);
  const [jobCardId, setJobCardId] = useState("");
  const [vendorName, setVendorName] = useState("");

  // Row-level problems: ours (missing name) or the API's ("expenses[2]: …").
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { data: jobCardsData, isLoading: jobCardsLoading } =
    useGetJobCardsQuery({ limit: 100 });
  const jobCardOptions = useMemo(
    () =>
      (jobCardsData?.data ?? []).map((jobCard) => ({
        label: `${jobCard.jobNumber} — ${jobCard.customerName ?? "No customer"}`,
        value: jobCard.id,
      })),
    [jobCardsData?.data],
  );

  const filled = rows.filter((row) => !isBlank(row));
  const total = filled.reduce((sum, row) => sum + rowTotal(row), 0);

  const updateRow = (key: number, patch: Partial<BulkRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
    setRowErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleModeChange = (mode: PaymentModeDto | "") => {
    const wasCash = paymentMode === PaymentModeDto.CASH;
    setPaymentMode(mode);
    if (
      wasCash !== (mode === PaymentModeDto.CASH) &&
      !accountPickedRef.current
    ) {
      setAccountId("");
    }
  };

  const save = async () => {
    const missingName = filled.filter((row) => !row.name.trim());
    if (missingName.length) {
      setRowErrors(
        Object.fromEntries(
          missingName.map((row) => [row.key, "Item name is required"]),
        ),
      );
      return;
    }
    if (!filled.length) {
      setFormError("Enter at least one expense.");
      return;
    }
    setFormError(null);
    setRowErrors({});

    const payload: CreateExpensePayload[] = filled.map((row) => ({
      date,
      name: row.name.trim(),
      category: row.category,
      quantity: toNum(row.quantity) || 1,
      unitCost: toNum(row.unitCost),
      amount: rowTotal(row),
      ...(paymentMode ? { paymentMode } : {}),
      ...(accountId ? { paidThroughAccountId: accountId } : {}),
      ...(jobCardId ? { jobCardId } : {}),
      ...(vendorName.trim() ? { vendorName: vendorName.trim() } : {}),
    }));

    try {
      await createMany(payload);
      navigate(RouteConstants.expenses.base.path);
    } catch (error) {
      // Nothing was saved. "expenses[2]: …" points at the third row sent —
      // map it back to the row on screen.
      if (!isAxiosError(error)) return;
      const message = getErrorMessage(error) as string;
      const match = /expenses\[(\d+)\]/.exec(message ?? "");
      const row = match ? filled[Number(match[1])] : undefined;
      if (row) {
        setRowErrors({
          [row.key]: message.replace(/^expenses\[\d+\]:\s*/, ""),
        });
      }
    }
  };

  return (
    <Stack gap="5" pb="6">
      <PageHeader
        title="Add Several Expenses"
        subtitle="A day's receipts or a supplier's bill in one go. All rows are saved together, or none are."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(RouteConstants.expenses.base.path)}
          >
            Cancel
          </Button>
        }
      />

      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        shadow="sm"
        p={{ base: "4", md: "5" }}
      >
        <Text textStyle="small-semibold" color="gray.500">
          Shared details
        </Text>
        <Text textStyle="tiny-regular" color="gray.300" mb="4">
          Applied to every expense below
        </Text>
        <Grid
          templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }}
          gap="4"
        >
          <CustomInput
            label="Date"
            type="date"
            required
            value={date}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDate(event.target.value)
            }
          />
          <CustomSelect
            label="How It Was Paid"
            placeholder="Select payment mode..."
            options={PAYMENT_MODE_OPTIONS}
            value={paymentMode ? [paymentMode] : undefined}
            onChange={(opt: { value: string[] }) =>
              handleModeChange((opt?.value?.[0] as PaymentModeDto) ?? "")
            }
          />
          <AccountSelect
            label="Paid From"
            includeCash
            isCash={paymentMode === PaymentModeDto.CASH}
            value={accountId}
            onChange={(next) => {
              accountPickedRef.current = true;
              setAccountId(next);
            }}
          />
          <CustomInput
            label="Supplier (optional)"
            value={vendorName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setVendorName(event.target.value)
            }
            placeholder="e.g. AutoParts Ltd"
          />
          <Box gridColumn={{ lg: "span 2" }}>
            <CustomSelect
              label="Job Card (optional)"
              placeholder="Select job card..."
              options={jobCardOptions}
              loading={jobCardsLoading}
              value={jobCardId ? [jobCardId] : undefined}
              onChange={(opt: { value: string[] }) =>
                setJobCardId(opt?.value?.[0] ?? "")
              }
            />
          </Box>
        </Grid>
      </Box>

      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        shadow="sm"
        p={{ base: "4", md: "5" }}
      >
        <Text textStyle="small-semibold" color="gray.500" mb="4">
          Expenses
        </Text>
        <Stack gap="3">
          {rows.map((row, index) => {
            const error = rowErrors[row.key];
            return (
              <Box
                key={row.key}
                borderWidth="1px"
                borderColor={error ? "error.200" : "gray.50"}
                bg={error ? "error.50" : "transparent"}
                rounded="md"
                p="3"
              >
                <Grid
                  templateColumns={{
                    base: "1fr 1fr",
                    md: "2fr 1.3fr 0.7fr 1fr 1fr auto",
                  }}
                  gap="3"
                  alignItems="end"
                >
                  <Box gridColumn={{ base: "1 / -1", md: "auto" }}>
                    <CustomInput
                      label={`Item ${index + 1}`}
                      value={row.name}
                      placeholder="e.g. Brake pads"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        updateRow(row.key, { name: event.target.value })
                      }
                    />
                  </Box>
                  <CustomSelect
                    label="Category"
                    options={EXPENSE_CATEGORY_OPTIONS}
                    value={[row.category]}
                    onChange={(opt: { value: string[] }) =>
                      updateRow(row.key, {
                        category:
                          (opt?.value?.[0] as ExpenseCategory) ?? "PARTS",
                      })
                    }
                  />
                  <CustomNumberInput
                    label="Qty"
                    precision={2}
                    min={0}
                    allowNegative={false}
                    value={row.quantity}
                    onValueChange={(raw) =>
                      updateRow(row.key, { quantity: raw })
                    }
                  />
                  <CustomNumberInput
                    label="Unit Cost (₦)"
                    precision={2}
                    min={0}
                    allowNegative={false}
                    placeholder="0.00"
                    value={row.unitCost}
                    onValueChange={(raw) =>
                      updateRow(row.key, { unitCost: raw })
                    }
                  />
                  <Box>
                    <Text textStyle="tiny-semibold" color="gray.300" mb="2.5">
                      Total
                    </Text>
                    <Text textStyle="small-semibold" color="gray.500" pb="2">
                      {formatMoney(rowTotal(row))}
                    </Text>
                  </Box>
                  <IconButton
                    aria-label="Remove row"
                    variant="ghost"
                    size="sm"
                    mb="1"
                    disabled={rows.length === 1}
                    onClick={() =>
                      setRows((prev) => prev.filter((r) => r.key !== row.key))
                    }
                  >
                    <TrashIcon color="gray.300" />
                  </IconButton>
                </Grid>
                {error && (
                  <Text textStyle="tiny-regular" color="error.300" mt="2">
                    {error}
                  </Text>
                )}
              </Box>
            );
          })}
        </Stack>
        <Button
          size="sm"
          variant="outline"
          mt="4"
          disabled={rows.length >= MAX_ROWS}
          onClick={() => setRows((prev) => [...prev, newRow()])}
        >
          + Add row
        </Button>
      </Box>

      <Flex
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
      >
        <Box>
          <Text textStyle="small-semibold" color="gray.500">
            {filled.length} expense{filled.length === 1 ? "" : "s"} ·{" "}
            {formatMoney(total)}
          </Text>
          {formError && (
            <Text textStyle="tiny-regular" color="error.300">
              {formError}
            </Text>
          )}
        </Box>
        <Button loading={isPending} onClick={() => void save()}>
          Save Expenses
        </Button>
      </Flex>
    </Stack>
  );
}
