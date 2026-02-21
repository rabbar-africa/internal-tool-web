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
import { formatCurrency } from "@/utils/calculations";
import { useCreatePaymentMutation } from "../../api/query";
import { MOCK_INVOICES } from "@/shared/data/mock";
import type {
  CreatePaymentPayload,
  PaymentMethod,
} from "@/shared/interface/payment";

const validationSchema = Yup.object({
  invoiceId: Yup.string().required("Invoice is required"),
  amount: Yup.number()
    .min(1, "Amount must be greater than 0")
    .required("Amount is required"),
  paymentMethod: Yup.string().required("Payment method is required"),
  paymentDate: Yup.string().required("Payment date is required"),
  reference: Yup.string(),
  notes: Yup.string(),
});

const invoiceOptions = MOCK_INVOICES.map((inv) => ({
  label: `${inv.invoiceNumber} — ${inv.customer.name} (Due: ${formatCurrency(inv.amountDue)})`,
  value: inv.id,
}));

const methodOptions: { label: string; value: PaymentMethod }[] = [
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Card", value: "card" },
  { label: "Cheque", value: "cheque" },
  { label: "POS", value: "pos" },
];

export function CreatePaymentPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreatePaymentMutation();

  const today = new Date().toISOString().split("T")[0];

  const initialValues = {
    invoiceId: "",
    amount: "",
    paymentMethod: "" as PaymentMethod | "",
    paymentDate: today,
    reference: "",
    notes: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    const payload: CreatePaymentPayload = {
      invoiceId: values.invoiceId,
      amount: Number(values.amount),
      paymentMethod: values.paymentMethod as PaymentMethod,
      paymentDate: values.paymentDate,
      reference: values.reference || undefined,
      notes: values.notes || undefined,
    };
    await mutateAsync(payload);
    navigate(RouteConstants.payments.base.path);
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
              Record Payment
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="1">
              Record a payment received from a customer
            </Text>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(RouteConstants.payments.base.path)}
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
            const selectedInvoice = MOCK_INVOICES.find(
              (inv) => inv.id === values.invoiceId,
            );

            return (
              <Form>
                <Stack gap="5">
                  {/* Section 1: Invoice Selection */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        1,
                        "Invoice",
                        "Select the invoice this payment applies to",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Stack gap="3">
                        <CustomSelect
                          label="Invoice"
                          required
                          options={invoiceOptions}
                          placeholder="Select invoice..."
                          value={
                            invoiceOptions.find(
                              (o) => o.value === values.invoiceId,
                            ) ?? null
                          }
                          onChange={(opt) => {
                            const selected = opt as { value: string } | null;
                            setFieldValue("invoiceId", selected?.value ?? "");
                            if (selected) {
                              const inv = MOCK_INVOICES.find(
                                (i) => i.id === selected.value,
                              );
                              if (inv) setFieldValue("amount", inv.amountDue);
                            }
                          }}
                          error={
                            touched.invoiceId && errors.invoiceId
                              ? errors.invoiceId
                              : undefined
                          }
                        />
                        {selectedInvoice && (
                          <Box
                            bg="blue.50"
                            px="4"
                            py="3"
                            rounded="md"
                            borderWidth="1px"
                            borderColor="blue.100"
                          >
                            <Grid templateColumns="1fr 1fr 1fr" gap="4">
                              <Box>
                                <Text fontSize="11px" color="gray.300" mb="1">
                                  Customer
                                </Text>
                                <Text
                                  fontSize="13px"
                                  fontWeight="500"
                                  color="gray.500"
                                >
                                  {selectedInvoice.customer.name}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontSize="11px" color="gray.300" mb="1">
                                  Invoice Total
                                </Text>
                                <Text
                                  fontSize="13px"
                                  fontWeight="500"
                                  color="gray.500"
                                >
                                  {formatCurrency(selectedInvoice.totalAmount)}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontSize="11px" color="gray.300" mb="1">
                                  Amount Due
                                </Text>
                                <Text
                                  fontSize="13px"
                                  fontWeight="600"
                                  color="orange.600"
                                >
                                  {formatCurrency(selectedInvoice.amountDue)}
                                </Text>
                              </Box>
                            </Grid>
                          </Box>
                        )}
                      </Stack>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 2: Payment Details */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        2,
                        "Payment Details",
                        "Enter the payment information",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap="4"
                      >
                        <CustomInput
                          label="Amount (₦)"
                          // type="number"
                          required
                          // register={asRegister("amount")}
                          value={String(values.amount)}
                          error={
                            touched.amount && errors.amount
                              ? errors.amount
                              : undefined
                          }
                        />
                        <CustomSelect
                          label="Payment Method"
                          required
                          options={methodOptions}
                          placeholder="Select method..."
                          value={
                            methodOptions.find(
                              (o) => o.value === values.paymentMethod,
                            ) ?? null
                          }
                          onChange={(opt) => {
                            const selected = opt as {
                              value: PaymentMethod;
                            } | null;
                            setFieldValue(
                              "paymentMethod",
                              selected?.value ?? "",
                            );
                          }}
                          error={
                            touched.paymentMethod && errors.paymentMethod
                              ? errors.paymentMethod
                              : undefined
                          }
                        />
                        <CustomInput
                          label="Payment Date"
                          type="date"
                          required
                          // register={asRegister("paymentDate")}
                          value={values.paymentDate}
                          error={
                            touched.paymentDate && errors.paymentDate
                              ? errors.paymentDate
                              : undefined
                          }
                        />
                        <CustomInput
                          label="Reference / Transaction ID"
                          // register={asRegister("reference")}
                          value={values.reference}
                          placeholder="e.g. TXN-123456"
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
                            placeholder="Any additional notes about this payment..."
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
                        navigate(RouteConstants.payments.base.path)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isPending}
                      loadingText="Recording..."
                    >
                      Record Payment
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
