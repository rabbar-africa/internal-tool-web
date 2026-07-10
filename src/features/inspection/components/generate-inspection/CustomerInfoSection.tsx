import { Box, Card, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import type { ICustomer } from "@/shared/interface/customer";
import { AddVehicleModal } from "@/features/customers/components/customer-detail/AddVehicleModal";
import { InspectionAddCustomerModal } from "./InspectionAddCustomerModal";
import type { InspectionFormApi } from "./useInspectionForm";

export function CustomerInfoSection({ form }: { form: InspectionFormApi }) {
  const {
    formik,
    customerOptions,
    vehicleOptions,
    customersLoading,
    vehiclesLoading,
    handleCustomerSearch,
    handleCustomerSelect,
    handleVehicleSelect,
    handleNewCustomerSaved,
    handleNewVehicleSaved,
    addCustomerOpen,
    setAddCustomerOpen,
    addVehicleOpen,
    setAddVehicleOpen,
  } = form;

  const { values, errors, touched } = formik;
  const selectedClientId = values.clientId;

  return (
    <>
      <Card.Root borderColor="gray.75" shadow="none" borderWidth="1px">
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
              <Text color="primary.300" fontSize="sm" fontWeight="600">
                1
              </Text>
            </Flex>
            <Box>
              <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                Customer & Vehicle
              </Text>
              <Text textStyle="xs" color="gray.200">
                Select or create the customer and their vehicle
              </Text>
            </Box>
          </HStack>
        </Card.Header>

        <Card.Body>
          <Stack gap="5">
            {/* Customer search */}
            <SearchCombobox
              label="Customer"
              required
              placeholder="Search by name or phone..."
              options={customerOptions}
              value={selectedClientId || undefined}
              onChange={(id) => handleCustomerSelect(id)}
              onSearchChange={handleCustomerSearch}
              searchDebounceMs={0}
              serverSearch
              isLoading={customersLoading}
              error={
                touched.clientId && errors.clientId
                  ? errors.clientId
                  : undefined
              }
              footerAction={{
                label: "Add New Customer",
                onClick: () => setAddCustomerOpen(true),
              }}
            />

            {/* Vehicle search (only after a customer is selected) */}
            {selectedClientId && (
              <SearchCombobox
                label="Vehicle"
                required
                placeholder={
                  vehiclesLoading
                    ? "Loading vehicles..."
                    : vehicleOptions.length === 0
                      ? "No vehicles — add one below"
                      : "Search vehicle..."
                }
                options={vehicleOptions}
                value={values.vehicleId || undefined}
                onChange={(id) => handleVehicleSelect(id)}
                isLoading={vehiclesLoading}
                emptyText="No vehicles found for this customer."
                error={
                  touched.vehicleId && errors.vehicleId
                    ? errors.vehicleId
                    : undefined
                }
                footerAction={{
                  label: "Add New Vehicle",
                  onClick: () => setAddVehicleOpen(true),
                }}
              />
            )}
          </Stack>
        </Card.Body>
      </Card.Root>

      <InspectionAddCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onSave={(customer) => handleNewCustomerSaved(customer as ICustomer)}
      />

      {selectedClientId && (
        <AddVehicleModal
          open={addVehicleOpen}
          onClose={() => setAddVehicleOpen(false)}
          clientId={selectedClientId}
          onVehicleSaved={handleNewVehicleSaved}
        />
      )}
    </>
  );
}
