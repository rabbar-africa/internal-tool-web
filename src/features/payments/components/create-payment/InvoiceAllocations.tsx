import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  HStack,
  Spinner,
  Text,
} from "@chakra-ui/react";
import type { FormikProps } from "formik";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { SectionCard } from "./SectionCard";
import type { CreatePaymentFormValues } from "./hooks/useCreatePayment";

interface InvoiceAllocationsProps {
  formik: FormikProps<CreatePaymentFormValues>;
  isLoading: boolean;
  onSetAmount: (index: number, value: string) => void;
  onAutoAllocate: () => void;
  onClear: () => void;
}

const COLS = "1.4fr 1fr 1fr 1fr 1.1fr";

export function InvoiceAllocations({
  formik,
  isLoading,
  onSetAmount,
  onAutoAllocate,
  onClear,
}: InvoiceAllocationsProps) {
  const { values } = formik;
  const { formatMoney } = useFormatMoney();
  const money = (n: number) =>
    formatMoney(n, { currencyCode: values.currencyCode });

  const hasCustomer = Boolean(values.customerId);
  const allocations = values.allocations;

  const body = () => {
    if (!hasCustomer)
      return (
        <Empty text="Select a customer above to see their outstanding invoices." />
      );
    if (isLoading)
      return (
        <Center py="8">
          <Spinner color="primary.300" />
        </Center>
      );
    if (!allocations.length)
      return <Empty text="This customer has no outstanding invoices." />;

    return (
      <Box
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        overflow="hidden"
      >
        <Grid
          templateColumns={COLS}
          gap="3"
          px="4"
          py="2.5"
          bg="gray.50"
          display={{ base: "none", md: "grid" }}
        >
          {["Invoice", "Date", "Due Date", "Balance", "Amount Applied"].map(
            (h, i) => (
              <Text
                key={h}
                fontSize="11px"
                fontWeight="600"
                color="gray.400"
                textAlign={i >= 3 ? "right" : "left"}
              >
                {h}
              </Text>
            ),
          )}
        </Grid>

        {allocations.map((row, idx) => (
          <Grid
            key={row.invoiceId}
            templateColumns={{ base: "1fr 1fr", md: COLS }}
            gap="3"
            px="4"
            py="3"
            borderTopWidth="1px"
            borderColor="gray.75"
            alignItems="center"
          >
            <Text fontSize="13px" fontWeight="600" color="gray.500">
              {row.invoiceNumber}
            </Text>
            <Text
              fontSize="12px"
              color="gray.400"
              display={{ base: "none", md: "block" }}
            >
              {row.invoiceDate
                ? moment(row.invoiceDate).format("DD MMM YYYY")
                : "—"}
            </Text>
            <Text
              fontSize="12px"
              color="gray.400"
              display={{ base: "none", md: "block" }}
            >
              {row.dueDate ? moment(row.dueDate).format("DD MMM YYYY") : "—"}
            </Text>
            <Text
              fontSize="13px"
              fontWeight="500"
              color="gray.500"
              textAlign={{ base: "left", md: "right" }}
            >
              {money(row.balance)}
            </Text>
            <Box>
              <CustomNumberInput
                precision={2}
                allowNegative={false}
                min={0}
                max={row.balance}
                name={`allocations.${idx}.amountApplied`}
                value={row.amountApplied}
                onValueChange={(str) => onSetAmount(idx, str)}
                inputProps={{ textAlign: "right" }}
              />
            </Box>
          </Grid>
        ))}
      </Box>
    );
  };

  return (
    <SectionCard
      step={3}
      title="Apply to Invoices"
      subtitle="Allocate this payment across outstanding invoices"
      action={
        hasCustomer && allocations.length ? (
          <HStack gap="2">
            <Button size="xs" variant="outline" onClick={onAutoAllocate}>
              Auto-allocate
            </Button>
            <Button size="xs" variant="ghost" onClick={onClear}>
              Clear
            </Button>
          </HStack>
        ) : undefined
      }
    >
      {body()}
    </SectionCard>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Flex
      py="8"
      px="4"
      align="center"
      justify="center"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="gray.75"
      rounded="lg"
    >
      <Text fontSize="13px" color="gray.300" textAlign="center">
        {text}
      </Text>
    </Flex>
  );
}
