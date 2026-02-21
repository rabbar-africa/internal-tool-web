import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Field, FieldArray, Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency, calculateLineTotal } from "@/utils/calculations";
import { useCreateInvoiceMutation } from "../../api/query";
import { MOCK_CUSTOMERS, MOCK_ITEMS } from "@/shared/data/mock";
import type { CreateInvoicePayload } from "@/shared/interface/invoice";

const lineItemSchema = Yup.object({
  itemId: Yup.string().required("Item required"),
  description: Yup.string().required("Description required"),
  quantity: Yup.number().min(1, "Min 1").required("Quantity required"),
  unitPrice: Yup.number().min(0).required(),
  taxRate: Yup.number().min(0).max(100),
});

const validationSchema = Yup.object({
  customerId: Yup.string().required("Customer is required"),
  issueDate: Yup.string().required("Issue date required"),
  dueDate: Yup.string().required("Due date required"),
  lineItems: Yup.array().of(lineItemSchema).min(1, "Add at least one item"),
  notes: Yup.string(),
});

const EMPTY_LINE_ITEM = {
  itemId: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 7.5,
};

const customerOptions = MOCK_CUSTOMERS.map((c) => ({
  label: c.name,
  value: c.id,
}));

const itemOptions = MOCK_ITEMS.map((item) => ({
  label: `${item.name} — ${formatCurrency(item.unitPrice)}`,
  value: item.id,
}));

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateInvoiceMutation();

  const today = new Date().toISOString().split("T")[0];
  const thirtyDays = new Date(Date.now() + 30 * 24 * 3600 * 1000)
    .toISOString()
    .split("T")[0];

  const handleSubmit = async (values: typeof initialValues) => {
    const payload: CreateInvoicePayload = {
      customerId: values.customerId,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      lineItems: values.lineItems,
      notes: values.notes,
    };
    await mutateAsync(payload);
    navigate(RouteConstants.invoices.base.path);
  };

  const initialValues = {
    customerId: "",
    issueDate: today,
    dueDate: thirtyDays,
    lineItems: [{ ...EMPTY_LINE_ITEM }],
    notes: "",
  };

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
              Create Invoice
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="1">
              Fill in the details to generate a new invoice
            </Text>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(RouteConstants.invoices.base.path)}
          >
            Cancel
          </Button>
        </Flex>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            // handleChange,
            // handleBlur,
            setFieldValue,
          }) => {
            const subtotal = values.lineItems.reduce(
              (s, li) => s + li.quantity * li.unitPrice,
              0,
            );
            const taxTotal = values.lineItems.reduce(
              (s, li) => s + li.quantity * li.unitPrice * (li.taxRate / 100),
              0,
            );
            const grandTotal = subtotal + taxTotal;

            // const asRegister = (name: string) => ({
            //   name,
            //   onChange:
            //     handleChange as React.ChangeEventHandler<HTMLInputElement>,
            //   onBlur: handleBlur as React.FocusEventHandler<HTMLInputElement>,
            //   ref: () => {},
            // });

            return (
              <Form>
                <Stack gap="5">
                  {/* Section 1: Customer */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      <HStack gap="2">
                        <Flex
                          w="8"
                          h="8"
                          bg="primary.50"
                          rounded="lg"
                          align="center"
                          justify="center"
                        >
                          <Text
                            color="primary.300"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            1
                          </Text>
                        </Flex>
                        <Box>
                          <Text
                            fontWeight="600"
                            color="gray.500"
                            fontSize=".875rem"
                          >
                            Customer
                          </Text>
                          <Text textStyle="xs" color="gray.200">
                            Select the customer for this invoice
                          </Text>
                        </Box>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <CustomSelect
                        label="Customer"
                        required
                        options={customerOptions}
                        placeholder="Select customer..."
                        value={
                          customerOptions.find(
                            (o) => o.value === values.customerId,
                          ) ?? null
                        }
                        onChange={(opt) => {
                          const selected = opt as { value: string } | null;
                          setFieldValue("customerId", selected?.value ?? "");
                        }}
                        error={
                          touched.customerId && errors.customerId
                            ? errors.customerId
                            : undefined
                        }
                      />
                    </Card.Body>
                  </Card.Root>

                  {/* Section 2: Dates */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      <HStack gap="2">
                        <Flex
                          w="8"
                          h="8"
                          bg="primary.50"
                          rounded="lg"
                          align="center"
                          justify="center"
                        >
                          <Text
                            color="primary.300"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            2
                          </Text>
                        </Flex>
                        <Box>
                          <Text
                            fontWeight="600"
                            color="gray.500"
                            fontSize=".875rem"
                          >
                            Invoice Dates
                          </Text>
                          <Text textStyle="xs" color="gray.200">
                            Set issue and due dates
                          </Text>
                        </Box>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap="4"
                      >
                        <CustomInput
                          label="Issue Date"
                          type="date"
                          required
                          // register={asRegister("issueDate")}
                          // defaultValue={values.issueDate}
                          value={values.issueDate}
                          error={
                            touched.issueDate && errors.issueDate
                              ? errors.issueDate
                              : undefined
                          }
                        />
                        <CustomInput
                          label="Due Date"
                          type="date"
                          required
                          // register={asRegister("dueDate")}
                          // defaultValue={values.dueDate}
                          value={values.dueDate}
                          error={
                            touched.dueDate && errors.dueDate
                              ? errors.dueDate
                              : undefined
                          }
                        />
                      </Grid>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 3: Line Items */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header>
                      <Flex justify="space-between" align="center">
                        <HStack gap="2">
                          <Flex
                            w="8"
                            h="8"
                            bg="primary.50"
                            rounded="lg"
                            align="center"
                            justify="center"
                          >
                            <Text
                              color="primary.300"
                              fontSize="sm"
                              fontWeight="600"
                            >
                              3
                            </Text>
                          </Flex>
                          <Box>
                            <Text
                              fontWeight="600"
                              color="gray.500"
                              fontSize=".875rem"
                            >
                              Line Items
                            </Text>
                            <Text textStyle="xs" color="gray.200">
                              Add services or products
                            </Text>
                          </Box>
                        </HStack>
                      </Flex>
                    </Card.Header>
                    <Card.Body>
                      <FieldArray name="lineItems">
                        {({ push, remove }) => (
                          <Stack gap="4">
                            {values.lineItems.map((lineItem, idx) => {
                              const lineTotal = calculateLineTotal(
                                lineItem.quantity,
                                lineItem.unitPrice,
                                lineItem.taxRate,
                              );
                              return (
                                <Box
                                  key={idx}
                                  p="4"
                                  borderWidth="1px"
                                  borderColor="gray.75"
                                  rounded="md"
                                >
                                  <Flex
                                    justify="space-between"
                                    align="center"
                                    mb="3"
                                  >
                                    <Text
                                      fontSize="13px"
                                      fontWeight="500"
                                      color="gray.400"
                                    >
                                      Item {idx + 1}
                                    </Text>
                                    {values.lineItems.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        color="red.400"
                                        onClick={() => remove(idx)}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </Flex>
                                  <Grid
                                    templateColumns={{
                                      base: "1fr",
                                      md: "2fr 1fr 1fr 1fr",
                                    }}
                                    gap="3"
                                    mb="3"
                                  >
                                    <CustomSelect
                                      label="Item / Service"
                                      required
                                      options={itemOptions}
                                      placeholder="Select item..."
                                      // value={
                                      //   itemOptions.find(
                                      //     (o) => o.value === lineItem.itemId,
                                      //   ) ?? null
                                      // }
                                      onChange={(opt) => {
                                        const selected = opt as {
                                          value: string;
                                        } | null;
                                        if (selected) {
                                          const item = MOCK_ITEMS.find(
                                            (i) => i.id === selected.value,
                                          );
                                          setFieldValue(
                                            `lineItems.${idx}.itemId`,
                                            selected.value,
                                          );
                                          setFieldValue(
                                            `lineItems.${idx}.description`,
                                            item?.name ?? "",
                                          );
                                          setFieldValue(
                                            `lineItems.${idx}.unitPrice`,
                                            item?.unitPrice ?? 0,
                                          );
                                          setFieldValue(
                                            `lineItems.${idx}.taxRate`,
                                            item?.taxRate ?? 0,
                                          );
                                        }
                                      }}
                                    />
                                    <CustomInput
                                      label="Quantity"
                                      // type="number"
                                      required
                                      // register={asRegister(
                                      //   `lineItems.${idx}.quantity`,
                                      // )}
                                      value={String(lineItem.quantity)}
                                    />
                                    <CustomInput
                                      label="Unit Price (₦)"
                                      // type="number"
                                      // register={asRegister(
                                      //   `lineItems.${idx}.unitPrice`,
                                      // )}
                                      value={String(lineItem.unitPrice)}
                                    />
                                    <CustomInput
                                      label="Tax %"
                                      // type="number"
                                      // register={asRegister(
                                      //   `lineItems.${idx}.taxRate`,
                                      // )}
                                      value={String(lineItem.taxRate)}
                                    />
                                  </Grid>
                                  <Flex justify="flex-end">
                                    <Text fontSize="13px" color="gray.400">
                                      Line Total:{" "}
                                      <Text
                                        as="span"
                                        fontWeight="600"
                                        color="gray.500"
                                      >
                                        {formatCurrency(lineTotal)}
                                      </Text>
                                    </Text>
                                  </Flex>
                                </Box>
                              );
                            })}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => push({ ...EMPTY_LINE_ITEM })}
                              alignSelf="flex-start"
                            >
                              + Add Item
                            </Button>
                          </Stack>
                        )}
                      </FieldArray>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 4: Summary */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      <HStack gap="2">
                        <Flex
                          w="8"
                          h="8"
                          bg="primary.50"
                          rounded="lg"
                          align="center"
                          justify="center"
                        >
                          <Text
                            color="primary.300"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            4
                          </Text>
                        </Flex>
                        <Text
                          fontWeight="600"
                          color="gray.500"
                          fontSize=".875rem"
                        >
                          Invoice Summary
                        </Text>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <Box maxW="320px" ml="auto">
                        <Stack gap="2">
                          <Flex justify="space-between">
                            <Text fontSize="13px" color="gray.300">
                              Subtotal
                            </Text>
                            <Text fontSize="13px" color="gray.500">
                              {formatCurrency(subtotal)}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontSize="13px" color="gray.300">
                              Tax
                            </Text>
                            <Text fontSize="13px" color="gray.500">
                              {formatCurrency(taxTotal)}
                            </Text>
                          </Flex>
                          <Separator />
                          <Flex justify="space-between">
                            <Text
                              fontSize="15px"
                              fontWeight="700"
                              color="gray.500"
                            >
                              Total
                            </Text>
                            <Text
                              fontSize="15px"
                              fontWeight="700"
                              color="gray.500"
                            >
                              {formatCurrency(grandTotal)}
                            </Text>
                          </Flex>
                        </Stack>
                      </Box>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 5: Notes */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      <HStack gap="2">
                        <Flex
                          w="8"
                          h="8"
                          bg="primary.50"
                          rounded="lg"
                          align="center"
                          justify="center"
                        >
                          <Text
                            color="primary.300"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            5
                          </Text>
                        </Flex>
                        <Text
                          fontWeight="600"
                          color="gray.500"
                          fontSize=".875rem"
                        >
                          Notes
                        </Text>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <Field name="notes">
                        {({
                          field,
                        }: {
                          field: React.InputHTMLAttributes<HTMLTextAreaElement>;
                        }) => (
                          <CustomTextArea
                            label="Notes / Payment Terms"
                            placeholder="Add any notes or payment terms..."
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
                        navigate(RouteConstants.invoices.base.path)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isPending}
                      loadingText="Creating..."
                    >
                      Create Invoice
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
