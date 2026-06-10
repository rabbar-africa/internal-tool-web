import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { useCreatePayment } from "./hooks/useCreatePayment";
import { PaymentFormHeader } from "./PaymentFormHeader";
import { PaymentDetails } from "./PaymentDetails";
import { InvoiceAllocations } from "./InvoiceAllocations";
import { PaymentSummary } from "./PaymentSummary";
import { InvoicePreview } from "./InvoicePreview";
import { PresetPaymentFields } from "./PresetPaymentFields";
import { SectionCard } from "./SectionCard";

export function CreatePayment() {
  const {
    formik,
    isPending,
    isPresetMode,
    isLoadingPresetInvoice,
    presetInvoiceNotFound,
    presetSummary,
    customerOptions,
    setCustomerSearch,
    isSearchingCustomers,
    handleSelectCustomer,
    bankAccountOptions,
    handleSelectDepositAccount,
    isLoadingInvoices,
    setAllocationAmount,
    autoAllocate,
    clearAllocations,
    totals,
    handleCancel,
  } = useCreatePayment();

  return (
    <UserDashboardContainer py="1.5rem">
      <form onSubmit={formik.handleSubmit}>
        <Stack gap="5">
          {/* Top bar */}
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
                {isPresetMode
                  ? "Record a payment against this invoice"
                  : "Record a payment received from a customer"}
              </Text>
            </Box>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          </Flex>

          {isLoadingPresetInvoice ? (
            <Center py="16">
              <Spinner color="primary.300" />
            </Center>
          ) : presetInvoiceNotFound ? (
            <SectionCard step={1} title="Invoice not found">
              <Text fontSize="13px" color="gray.300">
                We couldn't load the invoice for this payment. It may have been
                removed. You can record a payment manually instead.
              </Text>
            </SectionCard>
          ) : isPresetMode ? (
            /* ───────────────────────────────────────── Invoice-driven flow ───────────────────────────────── */
            <>
              <InvoicePreview summary={presetSummary} />
              <PresetPaymentFields formik={formik} />
              <SectionCard
                step={3}
                title="Notes"
                subtitle="Optional additional information"
              >
                <CustomTextArea
                  name="notes"
                  rows={3}
                  placeholder="Add an internal note for this payment…"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                />
              </SectionCard>
            </>
          ) : (
            /* ───────────────────────────────────────── Manual flow ───────────────────────────────────────── */
            <>
              <PaymentFormHeader
                formik={formik}
                customerOptions={customerOptions}
                isSearchingCustomers={isSearchingCustomers}
                onCustomerSearch={setCustomerSearch}
                onSelectCustomer={handleSelectCustomer}
              />

              <PaymentDetails
                formik={formik}
                bankAccountOptions={bankAccountOptions}
                onSelectDepositAccount={handleSelectDepositAccount}
              />

              <InvoiceAllocations
                formik={formik}
                isLoading={isLoadingInvoices}
                onSetAmount={setAllocationAmount}
                onAutoAllocate={autoAllocate}
                onClear={clearAllocations}
              />

              <SectionCard
                step={4}
                title="Notes"
                subtitle="Optional additional information"
              >
                <CustomTextArea
                  name="notes"
                  rows={3}
                  placeholder="Add an internal note for this payment…"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                />
              </SectionCard>

              <PaymentSummary
                currencyCode={formik.values.currencyCode}
                totals={totals}
              />
            </>
          )}

          {!isLoadingPresetInvoice && !presetInvoiceNotFound && (
            <Flex justify="flex-end" gap="3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isPending}
                loadingText="Recording..."
                disabled={!isPresetMode && totals.overApplied}
              >
                Record Payment
              </Button>
            </Flex>
          )}
        </Stack>
      </form>
    </UserDashboardContainer>
  );
}
