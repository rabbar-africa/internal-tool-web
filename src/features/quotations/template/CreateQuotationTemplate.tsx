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
import { useNavigate } from "react-router-dom";
import { useCreateInvoice } from "@/features/invoices/components/create-invoice/hooks/useCreateInvoice";
import { LineItemsTable } from "@/features/invoices/components/create-invoice/LineItemsTable";
import { InvoiceFooter } from "@/features/invoices/components/create-invoice/InvoiceFooter";
import { RouteConstants } from "@/shared/constants/routes";
import { QuotationFormHeader } from "../components/quotation-form/QuotationFormHeader";
import { quotationActions } from "../utils/quotation-status";

interface CreateQuotationTemplateProps {
  mode?: "create" | "edit";
}

export function CreateQuotationTemplate({
  mode = "create",
}: CreateQuotationTemplateProps) {
  const navigate = useNavigate();
  const {
    isEdit,
    isLoadingInvoice,
    quote,
    formik,
    handleSubmit,
    addLineItem,
    removeLineItem,
    customerOptions,
    selectedCustomer,
    handleItemSelect,
    totals,
    taxes,
    getLineAmount,
    isPending,
    handleCancel,
    items,
    addNewItem,
    addNewCustomer,
    handleCustomerSearch,
    isSearchingCustomers,
    handleItemSearch,
    isSearchingItems,
    vehicleOptions,
    vehiclesLoading,
    addVehicleOpen,
    openAddVehicle,
    closeAddVehicle,
    handleVehicleSaved,
  } = useCreateInvoice({ mode, document: "quotation" });

  if (isLoadingInvoice) {
    return (
      <Center py="20">
        <Spinner color="primary.400" />
      </Center>
    );
  }

  // Invoiced and void quotes are locked; the API would refuse the save.
  if (isEdit && quote && !quotationActions(quote).edit) {
    return (
      <Center py="20">
        <Stack gap="3" align="center" textAlign="center" maxW="26rem">
          <Text textStyle="large-bold" color="gray.500">
            {quote.quotationNumber} can't be edited
          </Text>
          <Text textStyle="small-regular" color="gray.300">
            {quote.status === "INVOICED"
              ? "It has been made into an invoice. Edit the invoice instead."
              : "It has been voided."}
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(
                RouteConstants.quotations.detail.generate({ id: quote.id }),
              )
            }
          >
            Back to the quote
          </Button>
        </Stack>
      </Center>
    );
  }

  const actions = (
    <>
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
        {isEdit ? "Save Changes" : "Save Quote"}
      </Button>
    </>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="4">
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              {isEdit ? "Edit Quote" : "New Quote"}
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="0.5">
              {isEdit
                ? "Update the details below and save your changes"
                : "Price the work for the customer before you do it"}
            </Text>
          </Box>
          <Flex gap="2" wrap="wrap">
            {actions}
          </Flex>
        </Flex>

        <Box
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          rounded="xl"
          overflow="hidden"
          shadow="sm"
        >
          <QuotationFormHeader
            formik={formik}
            customerOptions={customerOptions}
            selectedCustomer={selectedCustomer}
            onAddNewCustomer={addNewCustomer}
            onCustomerSearch={handleCustomerSearch}
            isSearchingCustomers={isSearchingCustomers}
            vehicleOptions={vehicleOptions}
            vehiclesLoading={vehiclesLoading}
            addVehicleOpen={addVehicleOpen}
            onOpenAddVehicle={openAddVehicle}
            onCloseAddVehicle={closeAddVehicle}
            onVehicleSaved={handleVehicleSaved}
          />

          <Separator borderColor="gray.75" />

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

          <InvoiceFooter
            formik={formik}
            totals={totals}
            taxes={taxes}
            documentLabel="quote"
          />
        </Box>

        <Flex justify="flex-end" gap="3" pb="4">
          {actions}
        </Flex>
      </Stack>
    </form>
  );
}
