import { useState, useRef } from "react";
import { useFormikContext } from "formik";
import { Box, Card, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import type { InspectionFormValues } from "./inspection-form.types";
import {
  useGetAllCustomersQuery,
  useGetVehiclesByClientQuery,
} from "@/features/customers/api/query";
import type { Vehicle } from "@/features/customers/api/service";
import type { ICustomer } from "@/shared/interface/customer";
import { AddVehicleModal } from "@/features/customers/components/customer-detail/AddVehicleModal";
import { InspectionAddCustomerModal } from "./InspectionAddCustomerModal";

export function CustomerInfoSection() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<InspectionFormValues>();

  // ── Local state ─────────────────────────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({ search: debouncedSearch, limit: 20 });

  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(selectedClientId);

  const customers: ICustomer[] = customersData?.data ?? [];
  const vehicles: Vehicle[] = vehiclesData?.data ?? vehiclesData ?? [];

  const customerOptions = customers.map((c) => ({
    label: c.displayName,
    value: c.id,
    subLabel: c.phone ?? c.email ?? undefined,
  }));

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.year} ${v.make} ${v.model}`,
    value: v.id,
    subLabel: v.registrationNumber,
  }));

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCustomerSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(query), 400);
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setSelectedClientId(customerId);
    void setFieldValue("clientId", customerId);
    void setFieldValue("vehicleId", "");
    void setFieldValue("vehicleNumber", "");
    void setFieldValue("vehicleName", "");
    void setFieldValue("vehicleColor", "");
    if (customer) {
      void setFieldValue("customerName", customer.displayName);
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      void setFieldValue("vehicleId", vehicleId);
      void setFieldValue("vehicleNumber", vehicle.registrationNumber);
      void setFieldValue("vehicleName", `${vehicle.make} ${vehicle.model}`);
      void setFieldValue("vehicleColor", vehicle.color ?? "");
    }
  };

  const handleNewCustomerSaved = (customer: ICustomer) => {
    setSelectedClientId(customer.id);
    void setFieldValue("clientId", customer.id);
    void setFieldValue("customerName", customer.displayName);
    void setFieldValue("vehicleId", "");
    void setFieldValue("vehicleNumber", "");
    void setFieldValue("vehicleName", "");
    void setFieldValue("vehicleColor", "");
  };

  const handleNewVehicleSaved = (vehicle: Vehicle) => {
    void setFieldValue("vehicleId", vehicle.id);
    void setFieldValue("vehicleNumber", vehicle.registrationNumber);
    void setFieldValue("vehicleName", `${vehicle.make} ${vehicle.model}`);
    void setFieldValue("vehicleColor", vehicle.color ?? "");
  };

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
            {/* ── Customer search ─────────────────────────────────────────── */}
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
                touched.customerName && errors.customerName
                  ? errors.customerName
                  : undefined
              }
              footerAction={{
                label: "Add New Customer",
                onClick: () => setAddCustomerOpen(true),
              }}
            />

            {/* ── Vehicle search (only after customer selected) ───────────── */}
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
                value={
                  values.vehicleNumber
                    ? vehicles.find(
                        (v) => v.registrationNumber === values.vehicleNumber,
                      )?.id
                    : undefined
                }
                onChange={(id) => handleVehicleSelect(id)}
                isLoading={vehiclesLoading}
                emptyText="No vehicles found for this customer."
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
        onSave={(customer) => {
          handleNewCustomerSaved(customer as ICustomer);
          setAddCustomerOpen(false);
        }}
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
