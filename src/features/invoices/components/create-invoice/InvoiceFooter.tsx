import { Box, Flex, Grid, Separator, Stack, Text } from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { CustomInput } from "@/components/input/CustomInput";
import { formatCurrency } from "@/utils/calculations";
import type { CreateInvoiceFormValues } from "./hooks/useCreateInvoice";

interface Totals {
  subtotal: number;
  entityDiscount: number;
  adjustmentVal: number;
  total: number;
}

interface InvoiceFooterProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  totals: Totals;
}

export function InvoiceFooter({ formik, totals }: InvoiceFooterProps) {
  const { subtotal, entityDiscount, adjustmentVal, total } = totals;

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 360px" }}
      gap="8"
      p={{ base: "4", md: "6" }}
    >
      {/* Left: Notes + Terms */}
      <Stack gap="4">
        <CustomTextArea
          label="Customer Notes"
          placeholder="Add a note for your customer (visible on the invoice)"
          rows={4}
          name="notes"
          value={formik.values.notes}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        <CustomTextArea
          label="Terms & Conditions"
          placeholder="Enter any terms and conditions"
          rows={4}
          name="terms"
          value={formik.values.terms}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Stack>

      {/* Right: Totals */}
      <Box
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        overflow="hidden"
        alignSelf="start"
      >
        <Box
          px="4"
          py="3"
          bg="gray.25"
          borderBottomWidth="1px"
          borderColor="gray.75"
        >
          <Text fontSize="13px" fontWeight="600" color="gray.500">
            Invoice Summary
          </Text>
        </Box>

        <Stack gap="0" px="4" py="3">
          <Flex justify="space-between" align="center" py="2">
            <Text fontSize="13px" color="gray.400">
              Subtotal
            </Text>
            <Text fontSize="13px" color="gray.500" fontWeight="500">
              {formatCurrency(subtotal)}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" py="2" gap="4">
            <Text fontSize="13px" color="gray.400" flexShrink={0}>
              Discount (₦)
            </Text>
            <Box w="120px">
              <CustomInput
                placeholder="0"
                name="discount"
                value={formik.values.discount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{
                  textAlign: "right",
                  fontSize: "13px",
                }}
              />
            </Box>
          </Flex>

          {entityDiscount > 0 && (
            <Flex justify="flex-end">
              <Text fontSize="12px" color="red.400">
                − {formatCurrency(entityDiscount)}
              </Text>
            </Flex>
          )}

          <Flex justify="space-between" align="center" py="2" gap="4">
            <Box>
              <Text fontSize="13px" color="gray.400">
                Adjustment
              </Text>
              <CustomInput
                placeholder="Label"
                name="adjustment_description"
                value={formik.values.adjustment_description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ fontSize: "11px", h: "24px", mt: "1" }}
              />
            </Box>
            <Box w="120px">
              <CustomInput
                placeholder="0"
                name="adjustment"
                value={formik.values.adjustment}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{
                  textAlign: "right",
                  fontSize: "13px",
                }}
              />
            </Box>
          </Flex>

          {adjustmentVal !== 0 && (
            <Flex justify="flex-end">
              <Text
                fontSize="12px"
                color={adjustmentVal > 0 ? "green.400" : "red.400"}
              >
                {adjustmentVal > 0 ? "+" : "−"}{" "}
                {formatCurrency(Math.abs(adjustmentVal))}
              </Text>
            </Flex>
          )}

          <Separator my="2" />

          <Flex
            justify="space-between"
            align="center"
            py="2"
            bg="primary.50"
            mx="-4"
            px="4"
            rounded="md"
          >
            <Text fontSize="14px" fontWeight="700" color="gray.500">
              Total
            </Text>
            <Text fontSize="16px" fontWeight="700" color="primary.400">
              {formatCurrency(total)}
            </Text>
          </Flex>
        </Stack>
      </Box>
    </Grid>
  );
}
