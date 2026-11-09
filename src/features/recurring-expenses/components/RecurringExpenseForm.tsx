import { useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  SegmentGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { AccountSelect } from "@/features/settings/components/account-details/AccountSelect";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import {
  EXPENSE_CATEGORY_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  type ExpenseCategory,
} from "@/shared/interface/expense";
import { PaymentModeDto } from "@/shared/interface/payment";
import type {
  CreateRecurringExpensePayload,
  IRecurringExpense,
  RecurrenceUnit,
  UpdateRecurringExpensePayload,
} from "@/shared/interface/recurring-expense";
import {
  FREQUENCY_PICKS,
  UNIT_OPTIONS,
  formatDay,
  previewDates,
  todayIso,
} from "../utils/recurring";

export type EndMode = "never" | "date" | "count";

export interface RecurringExpenseFormValues {
  name: string;
  category: ExpenseCategory;
  amount: string;
  vendorName: string;
  paymentMode: PaymentModeDto | "";
  /** "" uses the default account each time. */
  paidThroughAccountId: string;
  notes: string;
  every: string;
  unit: RecurrenceUnit;
  startDate: string;
  endMode: EndMode;
  endDate: string;
  maxCount: string;
}

export const emptyRecurringValues = (): RecurringExpenseFormValues => ({
  name: "",
  category: "RENT",
  amount: "",
  vendorName: "",
  paymentMode: "",
  paidThroughAccountId: "",
  notes: "",
  every: "1",
  unit: "MONTH",
  startDate: todayIso(),
  endMode: "never",
  endDate: "",
  maxCount: "",
});

export function scheduleToValues(
  schedule: IRecurringExpense,
): RecurringExpenseFormValues {
  return {
    name: schedule.name,
    category: schedule.category,
    amount: String(Number(schedule.amount) || ""),
    vendorName: schedule.vendorName ?? "",
    paymentMode: schedule.paymentMode ?? "",
    paidThroughAccountId: schedule.paidThroughAccountId ?? "",
    notes: schedule.notes ?? "",
    every: String(schedule.every),
    unit: schedule.unit,
    startDate: schedule.startDate.slice(0, 10),
    endMode: schedule.endDate ? "date" : schedule.maxCount ? "count" : "never",
    endDate: schedule.endDate?.slice(0, 10) ?? "",
    maxCount: schedule.maxCount ? String(schedule.maxCount) : "",
  };
}

const ends = (values: RecurringExpenseFormValues) =>
  values.endMode === "date"
    ? { endDate: values.endDate, maxCount: null }
    : values.endMode === "count"
      ? { endDate: null, maxCount: Number(values.maxCount) }
      : { endDate: null, maxCount: null };

/** On create, "never" sends neither end, and the default account nothing. */
export function toCreatePayload(
  values: RecurringExpenseFormValues,
): CreateRecurringExpensePayload {
  const end = ends(values);
  return {
    name: values.name.trim(),
    category: values.category,
    amount: Number(values.amount),
    every: Number(values.every),
    unit: values.unit,
    startDate: values.startDate,
    ...(end.endDate ? { endDate: end.endDate } : {}),
    ...(end.maxCount ? { maxCount: end.maxCount } : {}),
    ...(values.vendorName.trim()
      ? { vendorName: values.vendorName.trim() }
      : {}),
    ...(values.paymentMode ? { paymentMode: values.paymentMode } : {}),
    ...(values.paidThroughAccountId
      ? { paidThroughAccountId: values.paidThroughAccountId }
      : {}),
    ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
  };
}

/**
 * On edit, nulls clear: no end, no vendor, the default account. The start is
 * sent only when changed, since an old one is in the past (a 400).
 */
export function toUpdatePayload(
  values: RecurringExpenseFormValues,
  initial: RecurringExpenseFormValues,
): UpdateRecurringExpensePayload {
  return {
    name: values.name.trim(),
    category: values.category,
    amount: Number(values.amount),
    every: Number(values.every),
    unit: values.unit,
    ...(values.startDate !== initial.startDate
      ? { startDate: values.startDate }
      : {}),
    ...ends(values),
    vendorName: values.vendorName.trim() || null,
    paymentMode: values.paymentMode || null,
    paidThroughAccountId: values.paidThroughAccountId || null,
    notes: values.notes.trim() || null,
  };
}

function buildSchema(initialStart: string, isEdit: boolean) {
  return Yup.object({
    name: Yup.string().trim().required("What is it for? e.g. Shop rent"),
    amount: Yup.number()
      .typeError("Enter the amount")
      .moreThan(0, "Enter the amount")
      .required("Enter the amount"),
    every: Yup.number()
      .typeError("1 to 99")
      .integer("A whole number")
      .min(1, "1 to 99")
      .max(99, "1 to 99")
      .required("1 to 99"),
    startDate: Yup.string()
      .required("Pick the first date")
      .test(
        "not-past",
        "Pick today or later. Record past ones as ordinary expenses.",
        (value) =>
          !value || (isEdit && value === initialStart) || value >= todayIso(),
      ),
    endDate: Yup.string().when(
      ["endMode", "startDate"],
      ([endMode, start], s) =>
        endMode === "date"
          ? s
              .required("Pick the last date")
              .test(
                "after-start",
                "The last date can't be before the first",
                (value) => !value || !start || value >= start,
              )
          : s,
    ),
    maxCount: Yup.string().when("endMode", ([endMode], s) =>
      endMode === "count"
        ? s
            .required("How many times?")
            .test(
              "range",
              "1 to 1,000 times",
              (value) =>
                Number.isInteger(Number(value)) &&
                Number(value) >= 1 &&
                Number(value) <= 1000,
            )
        : s,
    ),
  });
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
      <Card.Header pb="0">
        <Text fontWeight="600" color="gray.500" fontSize=".875rem">
          {title}
        </Text>
        {subtitle && (
          <Text textStyle="xs" color="gray.300">
            {subtitle}
          </Text>
        )}
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card.Root>
  );
}

const END_OPTIONS: { value: EndMode; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "date", label: "On a date" },
  { value: "count", label: "After" },
];

const CUSTOM = "custom";
const pickKey = (pick: { every: number; unit: RecurrenceUnit }) =>
  `${pick.every}-${pick.unit}`;

interface RecurringExpenseFormProps {
  initialValues: RecurringExpenseFormValues;
  isEdit?: boolean;
  isSubmitting: boolean;
  onSubmit: (values: RecurringExpenseFormValues) => Promise<void> | void;
  onCancel: () => void;
}

export function RecurringExpenseForm({
  initialValues,
  isEdit = false,
  isSubmitting,
  onSubmit,
  onCancel,
}: RecurringExpenseFormProps) {
  const { formatMoney } = useFormatMoney();
  // Once someone picks an account, the payment mode stops choosing it.
  const accountPickedRef = useRef(Boolean(initialValues.paidThroughAccountId));
  const formik = useFormik<RecurringExpenseFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: buildSchema(initialValues.startDate, isEdit),
    onSubmit,
  });
  const { values, errors, touched, setFieldValue } = formik;
  const showError = (field: keyof RecurringExpenseFormValues) =>
    (touched[field] || formik.submitCount > 0) && errors[field]
      ? String(errors[field])
      : undefined;

  const every = Number(values.every) || 0;
  const startDay = values.startDate
    ? moment(values.startDate, "YYYY-MM-DD").date()
    : 0;
  const monthEndNote =
    startDay >= 29 && (values.unit === "MONTH" || values.unit === "YEAR")
      ? `In shorter months it records on the last day (the 30th in April, the 28th or 29th in February), then the ${moment(values.startDate).format("Do")} again.`
      : null;
  const preview = previewDates({
    startDate: values.startDate,
    every,
    unit: values.unit,
    endDate: values.endMode === "date" ? values.endDate : undefined,
    maxCount:
      values.endMode === "count"
        ? Number(values.maxCount) || undefined
        : undefined,
  });
  const startsToday = !isEdit && values.startDate === todayIso();

  // Daily is Premium. Standard plans don't see it at all, unless this
  // schedule is already daily (from before a downgrade).
  const { hasFeature } = usePlanAccess();
  const allowDaily =
    hasFeature("dailyRecurringExpenses") || initialValues.unit === "DAY";
  const picks = FREQUENCY_PICKS.filter((p) => allowDaily || p.unit !== "DAY");
  const unitOptions = UNIT_OPTIONS.filter(
    (o) => allowDaily || o.value !== "DAY",
  );
  const matchedPick = picks.find(
    (p) => p.every === every && p.unit === values.unit,
  );
  const [customFrequency, setCustomFrequency] = useState(!matchedPick);
  const frequency =
    customFrequency || !matchedPick ? CUSTOM : pickKey(matchedPick);
  const frequencyOptions = [
    ...picks.map((p) => ({ label: p.label, value: pickKey(p) })),
    { label: "Custom…", value: CUSTOM },
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="5">
        <Section title="The expense" subtitle="What it is and what it costs">
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
            <Box gridColumn={{ sm: "1 / -1" }}>
              <CustomInput
                label="Name"
                required
                name="name"
                placeholder="e.g. Shop rent, Musa's salary, Internet"
                value={values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={showError("name")}
              />
            </Box>
            <CustomNumberInput
              label="Amount (₦)"
              required
              precision={2}
              min={0}
              allowNegative={false}
              placeholder="0.00"
              name="amount"
              value={values.amount}
              onValueChange={(raw: string) => setFieldValue("amount", raw)}
              onBlur={formik.handleBlur}
              error={showError("amount")}
            />
            <CustomSelect
              label="Category"
              options={EXPENSE_CATEGORY_OPTIONS}
              value={[values.category]}
              onChange={(opt: { value: string[] }) =>
                setFieldValue("category", opt?.value?.[0] ?? "OTHER")
              }
            />
            <CustomInput
              label="Paid to (optional)"
              name="vendorName"
              placeholder="e.g. the landlord"
              value={values.vendorName}
              onChange={formik.handleChange}
            />
          </Grid>
        </Section>

        <Section
          title="When"
          subtitle="Rabbar records it as paid on each date, then emails you a list"
        >
          <Stack gap="4">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
              <CustomSelect
                label="How often"
                options={frequencyOptions}
                value={[frequency]}
                onChange={(opt: { value: string[] }) => {
                  const key = opt?.value?.[0];
                  if (!key) return;
                  if (key === CUSTOM) {
                    setCustomFrequency(true);
                    return;
                  }
                  const pick = picks.find((p) => pickKey(p) === key);
                  if (!pick) return;
                  setCustomFrequency(false);
                  setFieldValue("every", String(pick.every));
                  setFieldValue("unit", pick.unit);
                }}
              />
              <Box>
                <CustomInput
                  label="Starts"
                  required
                  type="date"
                  name="startDate"
                  inputProps={{
                    min:
                      isEdit && values.startDate === initialValues.startDate
                        ? undefined
                        : todayIso(),
                  }}
                  value={values.startDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={showError("startDate")}
                />
              </Box>
            </Grid>

            {frequency === CUSTOM && (
              <Flex gap="2" align="flex-start">
                <Text fontSize="14px" color="gray.400" pt="2">
                  Every
                </Text>
                <Box w="5rem" flexShrink={0}>
                  <CustomNumberInput
                    name="every"
                    precision={0}
                    min={1}
                    max={99}
                    allowNegative={false}
                    inputProps={{ "aria-label": "Every" }}
                    value={values.every}
                    onValueChange={(raw: string) => setFieldValue("every", raw)}
                    onBlur={formik.handleBlur}
                    error={showError("every")}
                  />
                </Box>
                <Box w="9rem">
                  <CustomSelect
                    options={unitOptions}
                    value={[values.unit]}
                    onChange={(opt: { value: string[] }) =>
                      setFieldValue("unit", opt?.value?.[0] ?? "MONTH")
                    }
                  />
                </Box>
              </Flex>
            )}

            {(monthEndNote || startsToday) && (
              <Stack gap="1" mt="-2">
                {monthEndNote && (
                  <Text fontSize="12px" color="gray.300">
                    {monthEndNote}
                  </Text>
                )}
                {startsToday && (
                  <Text fontSize="12px" color="gray.400">
                    It starts today, so the first one is recorded as soon as you
                    save.
                  </Text>
                )}
              </Stack>
            )}

            <Box>
              <Text fontSize="13px" fontWeight="500" color="gray.500" mb="2">
                Ends
              </Text>
              <Flex
                gap="3"
                align={{ base: "stretch", sm: "flex-start" }}
                direction={{ base: "column", sm: "row" }}
              >
                <SegmentGroup.Root
                  size="sm"
                  value={values.endMode}
                  onValueChange={({ value }) =>
                    value && setFieldValue("endMode", value as EndMode)
                  }
                  flexShrink={0}
                  w={{ base: "100%", sm: "auto" }}
                >
                  <SegmentGroup.Indicator bg="white" shadow="sm" />
                  <SegmentGroup.Items
                    items={END_OPTIONS}
                    px="3"
                    flex={{ base: "1", sm: "unset" }}
                    cursor="pointer"
                    fontSize="13px"
                  />
                </SegmentGroup.Root>
                {values.endMode === "date" && (
                  <Box w={{ base: "100%", sm: "12rem" }}>
                    <CustomInput
                      type="date"
                      name="endDate"
                      inputProps={{
                        min: values.startDate || todayIso(),
                        "aria-label": "Last date",
                      }}
                      value={values.endDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={showError("endDate")}
                    />
                  </Box>
                )}
                {values.endMode === "count" && (
                  <Flex gap="2" align="flex-start">
                    <Box w="6rem">
                      <CustomNumberInput
                        name="maxCount"
                        precision={0}
                        min={1}
                        max={1000}
                        allowNegative={false}
                        inputProps={{ "aria-label": "How many times" }}
                        value={values.maxCount}
                        onValueChange={(raw: string) =>
                          setFieldValue("maxCount", raw)
                        }
                        onBlur={formik.handleBlur}
                        error={showError("maxCount")}
                      />
                    </Box>
                    <Text fontSize="14px" color="gray.400" pt="2">
                      times
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Box>

            {preview.length > 0 && (
              <Box bg="gray.25" rounded="md" px="3" py="2">
                <Text fontSize="13px" color="gray.400">
                  {isEdit ? "From the start date: " : "Records on "}
                  {preview.map((date) => formatDay(date)).join(", ")}
                  {preview.length === 4 ? " and so on" : ""}
                  {Number(values.amount) > 0
                    ? ` · ${formatMoney(Number(values.amount))} each`
                    : ""}
                </Text>
              </Box>
            )}
          </Stack>
        </Section>

        <Section
          title="Paid from"
          subtitle="How it's paid each time. No job card: it's an overhead"
        >
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
            <CustomSelect
              label="How It's Paid"
              placeholder="Select payment mode..."
              options={PAYMENT_MODE_OPTIONS}
              value={values.paymentMode ? [values.paymentMode] : undefined}
              onChange={(opt: { value: string[] }) => {
                const mode = (opt?.value?.[0] ?? "") as PaymentModeDto | "";
                setFieldValue("paymentMode", mode);
                // Let the default follow the mode until an account is picked.
                if (!accountPickedRef.current) {
                  setFieldValue("paidThroughAccountId", "");
                }
              }}
            />
            <AccountSelect
              label="Paid From"
              includeCash
              isCash={values.paymentMode === PaymentModeDto.CASH}
              value={values.paidThroughAccountId}
              onChange={(id) => {
                accountPickedRef.current = true;
                setFieldValue("paidThroughAccountId", id);
              }}
              helperText="Left as it is, the default account is used each time"
            />
            <Box gridColumn={{ sm: "1 / -1" }}>
              <CustomTextArea
                label="Notes (optional)"
                name="notes"
                rows={2}
                value={values.notes}
                onChange={formik.handleChange}
              />
            </Box>
          </Grid>
        </Section>

        {isEdit && (
          <Text fontSize="12px" color="gray.300">
            Changes apply to the expenses it records from now on. Ones already
            recorded are edited as expenses.
          </Text>
        )}

        <Flex justify="flex-end" gap="3">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingText="Saving...">
            {isEdit ? "Save Changes" : "Set Up"}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
