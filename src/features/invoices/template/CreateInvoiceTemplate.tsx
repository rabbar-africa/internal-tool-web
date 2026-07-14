import {
  Box,
  Button,
  Center,
  Flex,
  Separator,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCreateInvoice } from "@/features/invoices/components/create-invoice/hooks/useCreateInvoice";
import { InvoiceFormHeader } from "@/features/invoices/components/create-invoice/InvoiceFormHeader";
import { LineItemsTable } from "@/features/invoices/components/create-invoice/LineItemsTable";
import { InvoiceFooter } from "@/features/invoices/components/create-invoice/InvoiceFooter";
import { BroughtForwardSection } from "@/features/invoices/components/create-invoice/BroughtForwardSection";

interface CreateInvoiceTemplateProps {
  mode?: "create" | "edit";
}

export function CreateInvoiceTemplate({
  mode = "create",
}: CreateInvoiceTemplateProps) {
  const {
    isEdit,
    isLoadingInvoice,
    formik,
    addLineItem,
    removeLineItem,
    customerOptions,
    selectedCustomer,
    handleItemSelect,
    totals,
    applyVat,
    getLineAmount,
    isPending,
    handleCancel,
    items,
    carry,
    skipCarryFlush,

    addNewItem,
    addNewCustomer,
    handleCustomerSearch,
    isSearchingCustomers,
    handleItemSearch,
    isSearchingItems,
  } = useCreateInvoice({ mode });

  if (isLoadingInvoice) {
    return (
      <Center py="20">
        <Spinner color="primary.400" />
      </Center>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="4">
        {/* Top bar */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              {isEdit ? "Edit Invoice" : "New Invoice"}
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="0.5">
              {isEdit
                ? "Update the details below and save your changes"
                : "Fill in the details below to create an invoice"}
            </Text>
          </Box>
          <Flex gap="2" wrap="wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isPending}
              loadingText="Saving..."
            >
              {isEdit ? "Save Changes" : "Proceed"}
            </Button>
          </Flex>
        </Flex>

        {/* Document */}
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          rounded="xl"
          overflow="hidden"
          shadow="sm"
        >
          {/* Header: Customer + Invoice fields */}
          <InvoiceFormHeader
            formik={formik}
            customerOptions={customerOptions}
            selectedCustomer={selectedCustomer}
            onAddNewCustomer={addNewCustomer}
            onCustomerSearch={handleCustomerSearch}
            isSearchingCustomers={isSearchingCustomers}
          />

          <Separator borderColor="gray.75" />

          {/* Line items */}
          <LineItemsTable
            formik={formik}
            removeLineItem={removeLineItem}
            addLineItem={addLineItem}
            items={items}
            handleItemSelect={handleItemSelect}
            getLineAmount={getLineAmount}
            onAddNewItem={addNewItem}
            onItemSearch={handleItemSearch}
            isSearchingItems={isSearchingItems}
          />

          <Separator borderColor="gray.75" />

          {/* Notes + Totals */}
          <InvoiceFooter
            formik={formik}
            totals={totals}
            onApplyVat={applyVat}
          />

          <Separator borderColor="gray.75" />

          {/* Carry a prior unpaid invoice's balance onto this one */}
          <BroughtForwardSection
            carried={carry.carried}
            availableCandidates={carry.availableCandidates}
            isLoadingCandidates={carry.isLoadingCandidates}
            onAdd={carry.add}
            onRemove={carry.remove}
            isMutating={carry.isMutating || carry.isFlushing}
            broughtForwardTotal={carry.broughtForwardTotal}
            invoiceTotal={totals.total}
            customerId={formik.values.customerId}
            flushFailures={carry.flushFailures}
          />
        </Box>

        {/* The invoice saved but some balances couldn't be carried onto it. */}
        {carry.flushFailures.length > 0 && (
          <Box
            borderWidth="1px"
            borderColor="red.200"
            bg="red.50"
            rounded="lg"
            p="4"
          >
            <Text fontSize="13px" fontWeight="600" color="red.600">
              Invoice saved, but {carry.flushFailures.length}{" "}
              {carry.flushFailures.length === 1 ? "balance" : "balances"} could
              not be brought forward
            </Text>
            <Text fontSize="12px" color="red.500" mt="1">
              {carry.flushFailures
                .map((f) => `${f.invoice.invoiceNumber}: ${f.message}`)
                .join(" · ")}
            </Text>
            <Flex gap="2" mt="3">
              <Button
                type="submit"
                size="sm"
                loading={carry.isFlushing}
                loadingText="Retrying..."
              >
                Retry
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={carry.isFlushing}
                onClick={skipCarryFlush}
              >
                Skip and view invoice
              </Button>
            </Flex>
          </Box>
        )}

        {/* Bottom actions */}
        <Flex justify="flex-end" gap="3" pb="4">
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending} loadingText="Saving...">
            {isEdit ? "Save Changes" : "Proceed"}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
