import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { RouteConstants } from "@/shared/constants/routes";
import { useCreateExpenseMutation } from "../../api/query";
import { MOCK_INVOICES } from "@/shared/data/mock";
import { EXPENSE_CATEGORY_LABELS } from "@/shared/interface/expense";
import type {
  CreateExpensePayload,
  ExpenseCategory,
} from "@/shared/interface/expense";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  category: Yup.string().required("Category is required"),
  vendor: Yup.string(),
  amount: Yup.number()
    .min(1, "Amount must be greater than 0")
    .required("Amount is required"),
  expenseDate: Yup.string().required("Date is required"),
  linkedInvoiceId: Yup.string(),
  notes: Yup.string(),
});

const categoryOptions = (
  Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]
).map((key) => ({
  label: EXPENSE_CATEGORY_LABELS[key],
  value: key,
}));

const invoiceOptions = [
  { label: "None", value: "" },
  ...MOCK_INVOICES.map((inv) => ({
    label: `${inv.invoiceNumber} — ${inv.customer.name}`,
    value: inv.id,
  })),
];

export function CreateExpensePage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateExpenseMutation();

  const today = new Date().toISOString().split("T")[0];

  const initialValues = {
    title: "",
    category: "" as ExpenseCategory | "",
    vendor: "",
    amount: "",
    expenseDate: today,
    linkedInvoiceId: "",
    notes: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    const payload: CreateExpensePayload = {
      title: values.title,
      category: values.category as ExpenseCategory,
      vendor: values.vendor || undefined,
      amount: Number(values.amount),
      expenseDate: values.expenseDate,
      linkedInvoiceId: values.linkedInvoiceId || undefined,
      notes: values.notes || undefined,
    };
    await mutateAsync(payload);
    navigate(RouteConstants.expenses.base.path);
  };

  const sectionHeader = (num: number, title: string, subtitle?: string) => (
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

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              Add Expense
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="1">
              Record a business expense
            </Text>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(RouteConstants.expenses.base.path)}
          >
            Cancel
          </Button>
        </Flex>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue }) => {
            // const asRegister = (name: string) => ({
            //   name,
            //   onChange: handleChange as React.ChangeEventHandler<HTMLInputElement>,
            //   onBlur: handleBlur as React.FocusEventHandler<HTMLInputElement>,
            //   ref: () => {},
            // });

            return (
              <Form>
                <Stack gap="5">
                  {/* Section 1: Expense Details */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        1,
                        "Expense Details",
                        "What was the expense for?",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap="4"
                      >
                        <Box gridColumn={{ sm: "1 / -1" }}>
                          <CustomInput
                            label="Expense Title"
                            required
                            // register={asRegister("title")}
                            // defaultValue={values.title}
                            placeholder="e.g. Engine oil purchase"
                            error={
                              touched.title && errors.title
                                ? errors.title
                                : undefined
                            }
                          />
                        </Box>
                        <CustomSelect
                          label="Category"
                          required
                          options={categoryOptions}
                          placeholder="Select category..."
                          // value={categoryOptions.find((o) => o.value === values.category) ?? null}
                          onChange={(opt) => {
                            const selected = opt as {
                              value: ExpenseCategory;
                            } | null;
                            setFieldValue("category", selected?.value ?? "");
                          }}
                          error={
                            touched.category && errors.category
                              ? errors.category
                              : undefined
                          }
                        />
                        <CustomInput
                          label="Vendor / Supplier"
                          // register={asRegister("vendor")}
                          // defaultValue={values.vendor}
                          placeholder="e.g. AutoParts Ltd"
                        />
                        <CustomInput
                          label="Amount (₦)"
                          // type="number"
                          required
                          // register={asRegister("amount")}
                          // defaultValue={String(values.amount)}
                          placeholder="0.00"
                          error={
                            touched.amount && errors.amount
                              ? errors.amount
                              : undefined
                          }
                        />
                      </Grid>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 2: Date & Linking */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        2,
                        "Date & Invoice Link",
                        "When and which invoice it relates to",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap="4"
                      >
                        <CustomInput
                          label="Expense Date"
                          type="date"
                          required
                          // register={asRegister("expenseDate")}
                          // defaultValue={values.expenseDate}
                          error={
                            touched.expenseDate && errors.expenseDate
                              ? errors.expenseDate
                              : undefined
                          }
                        />
                        <CustomSelect
                          label="Link to Invoice (optional)"
                          options={invoiceOptions}
                          placeholder="Select invoice..."
                          // value={invoiceOptions.find((o) => o.value === values.linkedInvoiceId) ?? null}
                          onChange={(opt) => {
                            const selected = opt as { value: string } | null;
                            setFieldValue(
                              "linkedInvoiceId",
                              selected?.value ?? "",
                            );
                          }}
                        />
                      </Grid>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 3: Notes */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        3,
                        "Notes",
                        "Optional additional information",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Field name="notes">
                        {({
                          field,
                        }: {
                          field: React.InputHTMLAttributes<HTMLTextAreaElement>;
                        }) => (
                          <CustomTextArea
                            label="Notes"
                            placeholder="Any additional notes about this expense..."
                            register={
                              field as Parameters<
                                typeof CustomTextArea
                              >[0]["register"]
                            }
                            value={values.notes}
                          />
                        )}
                      </Field>
                    </Card.Body>
                  </Card.Root>

                  <Flex justify="flex-end" gap="3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(RouteConstants.expenses.base.path)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isPending}
                      loadingText="Saving..."
                    >
                      Add Expense
                    </Button>
                  </Flex>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Stack>
    </UserDashboardContainer>
  );
}
