import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomFileInput } from "@/components/common/CustomFileInput";
import { uploadFile } from "@/features/paperwork/api/service";
import { useGetJobCardsQuery } from "@/features/job-cards/api/query";
import type { PaymentModeDto } from "@/shared/interface/payment";
import {
  EXPENSE_CATEGORY_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  type CreateExpensePayload,
  type Expense,
  type ExpenseCategory,
} from "@/shared/interface/expense";

interface ExpenseFormProps {
  /** Existing expense when editing; omit to create. */
  expense?: Expense;
  /** Preselected job card (e.g. arriving from a job card's expense tab). */
  defaultJobCardId?: string;
  isSubmitting: boolean;
  onSubmit: (payload: CreateExpensePayload) => Promise<void>;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Item name is required"),
  date: Yup.string().required("Date is required"),
  quantity: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Quantity must be a number")
    .moreThan(0, "Quantity must be greater than 0")
    .required("Quantity is required"),
  unitCost: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Unit cost must be a number")
    .min(0, "Unit cost cannot be negative")
    .required("Unit cost is required"),
  // Amount is derived from quantity × unit cost, so it's always present.
  amount: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Amount must be a number")
    .min(0, "Amount cannot be negative")
    .required("Amount is required"),
});

function SectionHeader({
  num,
  title,
  subtitle,
}: {
  num: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <HStack gap="2">
      <Flex
        w="8"
        h="8"
        bg="primary.50"
        rounded="lg"
        align="center"
        justify="center"
      >
        <Text color="primary.300" fontSize="sm" fontWeight="600">
          {num}
        </Text>
      </Flex>
      <Box>
        <Text fontWeight="600" color="gray.500" fontSize=".875rem">
          {title}
        </Text>
        {subtitle && (
          <Text textStyle="xs" color="gray.200">
            {subtitle}
          </Text>
        )}
      </Box>
    </HStack>
  );
}

export function ExpenseForm({
  expense,
  defaultJobCardId,
  isSubmitting,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const isEdit = Boolean(expense);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const today = new Date().toISOString().split("T")[0];

  const formik = useFormik({
    initialValues: {
      date: expense?.date ? expense.date.slice(0, 10) : today,
      name: expense?.name ?? "",
      description: expense?.description ?? "",
      category: (expense?.category ?? "PARTS") as ExpenseCategory,
      jobCardId: expense?.jobCardId ?? defaultJobCardId ?? "",
      vendorName: expense?.vendorName ?? "",
      quantity: expense ? String(Number(expense.quantity)) : "1",
      unitCost: expense ? String(Number(expense.unitCost)) : "",
      amount: expense ? String(Number(expense.amount)) : "",
      paymentMode: (expense?.paymentMode ?? "") as PaymentModeDto | "",
      notes: expense?.notes ?? "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      let receipt: Partial<CreateExpensePayload> = {};
      if (receiptFile) {
        setIsUploading(true);
        try {
          const uploaded = await uploadFile(receiptFile, "expenses");
          receipt = {
            fileUrl: uploaded.fileUrl,
            fileName: uploaded.fileName,
            fileType: uploaded.fileType,
            fileSize: uploaded.fileSize,
          };
        } finally {
          setIsUploading(false);
        }
      }

      await onSubmit({
        date: values.date,
        name: values.name,
        description: values.description || undefined,
        category: values.category,
        jobCardId: values.jobCardId || undefined,
        vendorName: values.vendorName || undefined,
        quantity: values.quantity ? Number(values.quantity) : undefined,
        unitCost: values.unitCost ? Number(values.unitCost) : undefined,
        amount: values.amount ? Number(values.amount) : undefined,
        paymentMode: values.paymentMode || undefined,
        notes: values.notes || undefined,
        ...receipt,
      });
    },
  });

  // Total amount is always derived from quantity × unit cost — the amount field
  // is read-only, so unit cost (not amount) is the value the user enters.
  const computeAmount = (quantity: string, unitCost: string) => {
    const qty = Number(quantity) || 0;
    const cost = Number(unitCost) || 0;
    const total = qty * cost;
    return total ? String(total) : "";
  };

  const handleQuantityChange = (raw: string) => {
    formik.setFieldValue("quantity", raw);
    formik.setFieldValue("amount", computeAmount(raw, formik.values.unitCost));
  };

  const handleUnitCostChange = (raw: string) => {
    formik.setFieldValue("unitCost", raw);
    formik.setFieldValue("amount", computeAmount(formik.values.quantity, raw));
  };

  const isBusy = isSubmitting || isUploading;

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="5">
        {/* Section 1: Expense Details */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={1}
              title="Expense Details"
              subtitle="What was purchased and what it cost"
            />
          </Card.Header>
          <Card.Body>
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
              <Box gridColumn={{ sm: "1 / -1" }}>
                <CustomInput
                  label="Item Name"
                  required
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. Brake pads"
                  error={
                    formik.touched.name && formik.errors.name
                      ? formik.errors.name
                      : undefined
                  }
                />
              </Box>
              <Box gridColumn={{ sm: "1 / -1" }}>
                <CustomTextArea
                  label="Description (optional)"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. Front ceramic brake pad set"
                  rows={2}
                />
              </Box>
              <CustomNumberInput
                label="Quantity"
                required
                precision={2}
                min={0}
                allowNegative={false}
                placeholder="1"
                name="quantity"
                value={formik.values.quantity}
                onValueChange={handleQuantityChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.quantity && formik.errors.quantity
                    ? formik.errors.quantity
                    : undefined
                }
              />
              <CustomNumberInput
                label="Unit Cost (₦)"
                required
                precision={2}
                min={0}
                allowNegative={false}
                placeholder="0.00"
                name="unitCost"
                value={formik.values.unitCost}
                onValueChange={handleUnitCostChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.unitCost && formik.errors.unitCost
                    ? formik.errors.unitCost
                    : undefined
                }
              />
              <CustomNumberInput
                label="Total Amount (₦)"
                precision={2}
                disabled
                placeholder="0.00"
                name="amount"
                value={formik.values.amount}
                helperText="Auto-calculated (quantity × unit cost)"
                error={
                  formik.touched.amount && formik.errors.amount
                    ? formik.errors.amount
                    : undefined
                }
              />
              <CustomInput
                label="Expense Date"
                type="date"
                required
                name="date"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.date && formik.errors.date
                    ? formik.errors.date
                    : undefined
                }
              />
              <CustomSelect
                label="Category"
                options={EXPENSE_CATEGORY_OPTIONS}
                value={[formik.values.category]}
                onChange={(opt: { value: string[] }) =>
                  formik.setFieldValue(
                    "category",
                    (opt?.value?.[0] as ExpenseCategory) ?? "PARTS",
                  )
                }
              />
              <CustomInput
                label="Vendor / Supplier"
                name="vendorName"
                value={formik.values.vendorName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. AutoParts Ltd"
              />
              <Box gridColumn={{ sm: "1 / -1" }}>
                <CustomSelect
                  label="How It Was Paid"
                  placeholder="Select payment mode..."
                  options={PAYMENT_MODE_OPTIONS}
                  value={
                    formik.values.paymentMode
                      ? [formik.values.paymentMode]
                      : undefined
                  }
                  onChange={(opt: { value: string[] }) =>
                    formik.setFieldValue("paymentMode", opt?.value?.[0] ?? "")
                  }
                />
              </Box>
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Section 2: Job Card Link */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={2}
              title="Job Card"
              subtitle="Linking makes this expense count against the job's profit"
            />
          </Card.Header>
          <Card.Body>
            <CustomSelect
              label="Link to Job Card (optional)"
              placeholder="Select job card..."
              options={jobCardOptions}
              loading={jobCardsLoading}
              value={
                formik.values.jobCardId ? [formik.values.jobCardId] : undefined
              }
              onChange={(opt: { value: string[] }) =>
                formik.setFieldValue("jobCardId", opt?.value?.[0] ?? "")
              }
            />
          </Card.Body>
        </Card.Root>

        {/* Section 3: Receipt & Notes */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={3}
              title="Receipt & Notes"
              subtitle="Optional supporting details"
            />
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <CustomFileInput
                label="Receipt"
                helperText={
                  isEdit && expense?.fileUrl && !receiptFile
                    ? "Choosing a new file replaces the current receipt"
                    : "Images or PDFs, up to 10MB"
                }
                inputProps={{
                  accept: "image/*,application/pdf",
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    setReceiptFile(e.target.files?.[0] ?? null),
                }}
              />
              {isEdit && expense?.fileUrl && (
                <Text textStyle="small-regular" color="gray.300">
                  Current receipt:{" "}
                  <Link
                    href={expense.fileUrl}
                    target="_blank"
                    color="primary.300"
                  >
                    {expense.fileName ?? "View file"}
                  </Link>
                </Text>
              )}
              <CustomTextArea
                label="Notes"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Anything else worth noting"
                rows={3}
              />
            </Stack>
          </Card.Body>
        </Card.Root>

        <Flex justify="flex-end" gap="3">
          <Button variant="outline" onClick={onCancel} disabled={isBusy}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isBusy}
            loadingText={isUploading ? "Uploading receipt..." : "Saving..."}
          >
            {isEdit ? "Save Changes" : "Add Expense"}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
