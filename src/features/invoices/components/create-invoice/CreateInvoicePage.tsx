import { Box, Button, Flex, Separator, Stack, Text } from "@chakra-ui/react";
import { UserDashboardContainer } from "@/components/hoc";
import { useCreateInvoice } from "./hooks/useCreateInvoice";
import { InvoiceFormHeader } from "./InvoiceFormHeader";
import { LineItemsTable } from "./LineItemsTable";
import { InvoiceFooter } from "./InvoiceFooter";

export function CreateInvoicePage() {
  const {
    formik,
    addLineItem,
    removeLineItem,
    customerOptions,
    selectedCustomer,
    handleItemSelect,
    totals,
    getLineAmount,
    isPending,
    handleCancel,
    itemOptions,
  } = useCreateInvoice();

  return (
    <UserDashboardContainer py="1.5rem">
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
                New Invoice
              </Text>
              <Text textStyle="small-regular" color="gray.300" mt="0.5">
                Fill in the details below to create an invoice
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
                Save as Draft
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
            />

            <Separator borderColor="gray.75" />

            {/* Line items */}
            <LineItemsTable
              formik={formik}
              removeLineItem={removeLineItem}
              addLineItem={addLineItem}
              itemOptions={itemOptions}
              handleItemSelect={handleItemSelect}
              getLineAmount={getLineAmount}
            />

            <Separator borderColor="gray.75" />

            {/* Notes + Totals */}
            <InvoiceFooter formik={formik} totals={totals} />
          </Box>

          {/* Bottom actions */}
          <Flex justify="flex-end" gap="3" pb="4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending} loadingText="Saving...">
              Save as Draft
            </Button>
          </Flex>
        </Stack>
      </form>
    </UserDashboardContainer>
  );
}
