import { useState } from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import type { CreateInvoiceFormValues } from "@/shared/interface/invoice";
import type { ICustomer } from "@/shared/interface/customer";
import type { Vehicle } from "@/features/customers/api/service";
import { AddVehicleModal } from "@/features/customers/components/customer-detail/AddVehicleModal";
import { AddNewCustomerModal } from "./AddNewCustomerModal";

export interface CustomerVehicleSectionProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  customerOptions: { label: string; value: string; subLabel?: string }[];
  selectedCustomer: ICustomer | null;
  onAddNewCustomer: (customer: ICustomer) => void;
  onCustomerSearch: (query: string) => void;
  isSearchingCustomers: boolean;
  vehicleOptions?: { label: string; value: string; subLabel?: string }[];
  vehiclesLoading?: boolean;
  addVehicleOpen?: boolean;
  onOpenAddVehicle?: () => void;
  onCloseAddVehicle?: () => void;
  onVehicleSaved?: (vehicle: Vehicle) => void;
}

/**
 * Who the document is for: customer, vehicle and billing address, with the
 * add-customer and add-vehicle dialogs. Shared by invoices and quotes.
 */
export function CustomerVehicleSection({
  formik,
  customerOptions,
  selectedCustomer,
  onAddNewCustomer,
  onCustomerSearch,
  isSearchingCustomers,
  vehicleOptions = [],
  vehiclesLoading = false,
  addVehicleOpen = false,
  onOpenAddVehicle,
  onCloseAddVehicle,
  onVehicleSaved,
}: CustomerVehicleSectionProps) {
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  return (
    <>
      <Stack gap="4">
        <Box maxW={{ base: "15rem", lg: "unset" }}>
          <SearchCombobox
            label="Select Customer"
            required
            options={customerOptions}
            placeholder="Search customer..."
            value={formik.values.customerId || undefined}
            onChange={(val, option) => {
              formik.setFieldValue("customerId", val);
              formik.setFieldValue("customer", {
                name: option.label,
                email: option.subLabel ?? "",
              });
              formik.setFieldValue("vehicleId", "");
            }}
            onSearchChange={onCustomerSearch}
            searchDebounceMs={400}
            serverSearch
            isLoading={isSearchingCustomers}
            error={
              formik.touched.customerId && formik.errors.customerId
                ? String(formik.errors.customerId)
                : undefined
            }
            footerAction={{
              label: "Add Customer",
              onClick: () => setAddCustomerOpen(true),
            }}
          />
        </Box>

        <Box maxW={{ base: "15rem", lg: "unset" }}>
          <SearchCombobox
            label="Select Vehicle"
            options={vehicleOptions}
            placeholder={
              !formik.values.customerId
                ? "Select a customer first"
                : vehiclesLoading
                  ? "Loading vehicles..."
                  : vehicleOptions.length > 0
                    ? "Search vehicle..."
                    : "No vehicles found — add one"
            }
            disabled={!formik.values.customerId || vehiclesLoading}
            value={formik.values.vehicleId || undefined}
            onChange={(val) => formik.setFieldValue("vehicleId", val)}
            isLoading={vehiclesLoading}
            emptyText="No matching vehicles found."
            footerAction={
              formik.values.customerId && onOpenAddVehicle
                ? {
                    label: "Add Vehicle",
                    onClick: onOpenAddVehicle,
                  }
                : undefined
            }
          />
        </Box>

        {selectedCustomer ? (
          <Box
            p="3"
            bg="gray.25"
            borderWidth="1px"
            borderColor="gray.75"
            rounded="md"
          >
            <Text
              fontSize="11px"
              fontWeight="600"
              color="gray.300"
              textTransform="uppercase"
              letterSpacing="0.05em"
              mb="2"
            >
              Billing Address
            </Text>
            <Text fontSize="13px" fontWeight="500" color="gray.500">
              {selectedCustomer.displayName}
            </Text>
            {selectedCustomer.address && (
              <Text fontSize="13px" color="gray.400">
                {selectedCustomer.address}
              </Text>
            )}
            <Text fontSize="13px" color="gray.400">
              {[selectedCustomer.city, selectedCustomer.state]
                .filter(Boolean)
                .join(", ")}
            </Text>
            {selectedCustomer.country && (
              <Text fontSize="13px" color="gray.400">
                {selectedCustomer.country}
              </Text>
            )}
            {selectedCustomer.email && (
              <Text fontSize="13px" color="gray.400" mt="1">
                {selectedCustomer.email}
              </Text>
            )}
            {selectedCustomer.phone && (
              <Text fontSize="13px" color="gray.400">
                {selectedCustomer.phone}
              </Text>
            )}
          </Box>
        ) : (
          <Flex
            align="center"
            justify="center"
            h="100px"
            borderWidth="1px"
            borderColor="gray.75"
            borderStyle="dashed"
            rounded="md"
          >
            <Text fontSize="13px" color="gray.200">
              Billing address will appear here
            </Text>
          </Flex>
        )}
      </Stack>

      <AddNewCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onSave={(customer) => {
          onAddNewCustomer(customer);
          formik.setFieldValue("customerId", customer.id);
          formik.setFieldValue("customer", {
            name: customer.displayName,
            email: customer.email ?? "",
          });
          setAddCustomerOpen(false);
        }}
      />

      {onCloseAddVehicle && (
        <AddVehicleModal
          open={addVehicleOpen}
          onClose={onCloseAddVehicle}
          clientId={formik.values.customerId}
          onVehicleSaved={onVehicleSaved}
        />
      )}
    </>
  );
}
