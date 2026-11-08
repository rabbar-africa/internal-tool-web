import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { RouteConstants } from "@/shared/constants/routes";
import { useCreatePayment } from "@/features/payments/components/create-payment/hooks/useCreatePayment";
import { PaymentFormHeader } from "@/features/payments/components/create-payment/PaymentFormHeader";
import { PaymentDetails } from "@/features/payments/components/create-payment/PaymentDetails";
import { InvoiceAllocations } from "@/features/payments/components/create-payment/InvoiceAllocations";
import { PaymentSummary } from "@/features/payments/components/create-payment/PaymentSummary";
import { InvoicePreview } from "@/features/payments/components/create-payment/InvoicePreview";
import { PresetPaymentFields } from "@/features/payments/components/create-payment/PresetPaymentFields";
import { SectionCard } from "@/features/payments/components/create-payment/SectionCard";

export function CreatePaymentTemplate() {
  const {
    formik,
    isPending,
    isEditMode,
    isLoadingEditPayment,
    isPresetMode,
    isLoadingPresetInvoice,
    presetInvoiceNotFound,
    presetSummary,
    customerOptions,
    setCustomerSearch,
    isSearchingCustomers,
    handleSelectCustomer,
    handleModeChange,
    handleSelectDepositAccount,
    depositFallbackAccountId,
    isLoadingInvoices,
    setAllocationAmount,
    autoAllocate,
    clearAllocations,
    totals,
    handleCancel,
  } = useCreatePayment();

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="5" pb={"1.5rem"}>
        {/* Top bar */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              {isEditMode ? "Edit Payment" : "Record Payment"}
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="1">
              {isEditMode
                ? "Update the details of this payment"
                : "Record a payment against this invoice"}
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

        {isLoadingPresetInvoice || isLoadingEditPayment ? (
          <Center py="16">
            <Spinner color="primary.300" />
          </Center>
        ) : presetInvoiceNotFound ? (
          <SectionCard step={1} title="Invoice not found">
            <Text fontSize="13px" color="gray.300">
              We couldn't load the invoice for this payment. It may have been
              removed.
            </Text>
            <GoToInvoices />
          </SectionCard>
        ) : !isPresetMode && !isEditMode ? (
          /* Payments are recorded against an invoice, never on their own. */
          <SectionCard step={1} title="Record payments from an invoice">
            <Text fontSize="13px" color="gray.300">
              Open the invoice the customer is paying and choose Record Payment
              from its menu.
            </Text>
            <GoToInvoices />
          </SectionCard>
        ) : isPresetMode ? (
          /* ───────────────────────────────────────── Invoice-driven flow ───────────────────────────────── */
          <>
            <InvoicePreview summary={presetSummary} />
            <PresetPaymentFields
              formik={formik}
              onModeChange={handleModeChange}
              onSelectDepositAccount={handleSelectDepositAccount}
              depositFallbackAccountId={depositFallbackAccountId}
            />
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
              onModeChange={handleModeChange}
              onSelectDepositAccount={handleSelectDepositAccount}
              depositFallbackAccountId={depositFallbackAccountId}
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

        {!isLoadingPresetInvoice &&
          !isLoadingEditPayment &&
          !presetInvoiceNotFound &&
          (isPresetMode || isEditMode) && (
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
                loadingText={isEditMode ? "Saving..." : "Recording..."}
                disabled={!isPresetMode && totals.overApplied}
              >
                {isEditMode ? "Save Changes" : "Record Payment"}
              </Button>
            </Flex>
          )}
      </Stack>
    </form>
  );
}

function GoToInvoices() {
  const navigate = useNavigate();
  return (
    <Button
      size="sm"
      mt="4"
      onClick={() => navigate(RouteConstants.invoices.base.path)}
    >
      Go to Invoices
    </Button>
  );
}
