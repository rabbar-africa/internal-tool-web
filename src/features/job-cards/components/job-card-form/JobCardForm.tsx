import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import { AddVehicleModal } from "@/features/customers/components/customer-detail/AddVehicleModal";
import {
  JOB_CARD_PRIORITY_OPTIONS,
  JOB_CARD_STATUS_OPTIONS,
  type CreateJobCardPayload,
  type JobCardDetail,
  type JobCardPriority,
  type JobCardStatus,
} from "@/shared/interface/job-card";
import { useJobCardForm } from "./useJobCardForm";

interface JobCardFormProps {
  /** Existing job card when editing; omit to create. */
  jobCard?: JobCardDetail;
  isSubmitting: boolean;
  onSubmit: (payload: CreateJobCardPayload) => Promise<void>;
  onCancel: () => void;
}

function SectionHeader({
  num,
  title,
  subtitle,
}: {
  num: number;
  title: string;
  subtitle?: string;
}) {
  return (
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
          {num}
        </Text>
      </Flex>
      <Box>
        <Text fontWeight="600" color="gray.500" fontSize=".875rem">
          {title}
        </Text>
        {subtitle && (
          <Text textStyle="xs" color="gray.200">
            {subtitle}
          </Text>
        )}
      </Box>
    </HStack>
  );
}

export function JobCardForm({
  jobCard,
  isSubmitting,
  onSubmit,
  onCancel,
}: JobCardFormProps) {
  const {
    isEdit,
    formik,
    customerOptions,
    isSearchingCustomers,
    setCustomerSearch,
    handleClientChange,
    vehicleOptions,
    vehiclesLoading,
    handleVehicleChange,
    handleVehicleSaved,
    addVehicleOpen,
    openAddVehicle,
    closeAddVehicle,
    technicianOptions,
    techniciansLoading,
  } = useJobCardForm({ jobCard, onSubmit });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="5">
        {/* Section 1: Customer */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={1}
              title="Customer"
              subtitle="Pick an existing customer or capture a walk-in"
            />
          </Card.Header>
          <Card.Body>
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
              <Box gridColumn={{ sm: "1 / -1" }}>
                <SearchCombobox
                  label="Existing Customer"
                  placeholder="Search customer by name..."
                  options={customerOptions}
                  value={formik.values.clientId || undefined}
                  onChange={handleClientChange}
                  onSearchChange={setCustomerSearch}
                  searchDebounceMs={400}
                  serverSearch
                  isLoading={isSearchingCustomers}
                  emptyText="No customers found. Leave empty for a walk-in."
                />
              </Box>
              <CustomInput
                label="Customer Name"
                required={!formik.values.clientId}
                name="customerName"
                value={formik.values.customerName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. Emeka Okafor"
                error={
                  formik.touched.customerName && formik.errors.customerName
                    ? formik.errors.customerName
                    : undefined
                }
              />
              <CustomInput
                label="Customer Phone"
                name="customerPhone"
                value={formik.values.customerPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. 0801 234 5678"
              />
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Section 2: Vehicle */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={2}
              title="Vehicle"
              subtitle="Choose one of the customer's saved vehicles, or add a new one"
            />
          </Card.Header>
          <Card.Body>
            {formik.values.clientId ? (
              <SearchCombobox
                label="Vehicle"
                placeholder={
                  vehicleOptions.length > 0
                    ? "Search vehicle..."
                    : "No saved vehicles yet — add one"
                }
                options={vehicleOptions}
                value={formik.values.vehicleId || undefined}
                onChange={handleVehicleChange}
                isLoading={vehiclesLoading}
                emptyText="No matching vehicles."
                footerAction={{
                  label: "Add Vehicle",
                  onClick: openAddVehicle,
                }}
              />
            ) : (
              <Text textStyle="small-regular" color="gray.300">
                Select a customer above to choose or add a vehicle.
              </Text>
            )}
          </Card.Body>
        </Card.Root>

        {/* Section 3: Job Details */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={3}
              title="Job Details"
              subtitle="What was reported and how the job is scheduled"
            />
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <Grid
                templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }}
                gap="4"
              >
                <CustomSelect
                  label="Status"
                  options={JOB_CARD_STATUS_OPTIONS}
                  value={[formik.values.status]}
                  onChange={(opt: { value: string[] }) =>
                    formik.setFieldValue(
                      "status",
                      (opt?.value?.[0] as JobCardStatus) ?? "OPEN",
                    )
                  }
                />
                <CustomSelect
                  label="Priority"
                  options={JOB_CARD_PRIORITY_OPTIONS}
                  value={[formik.values.priority]}
                  onChange={(opt: { value: string[] }) =>
                    formik.setFieldValue(
                      "priority",
                      (opt?.value?.[0] as JobCardPriority) ?? "NORMAL",
                    )
                  }
                />
                <CustomInput
                  label="Opened Date"
                  type="date"
                  name="openedAt"
                  value={formik.values.openedAt}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <CustomInput
                  label="Promised Date"
                  type="date"
                  name="promisedDate"
                  value={formik.values.promisedDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>

              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                <CustomInput
                  label="Odometer In (km)"
                  name="odometerIn"
                  value={formik.values.odometerIn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. 84500"
                  error={
                    formik.touched.odometerIn && formik.errors.odometerIn
                      ? formik.errors.odometerIn
                      : undefined
                  }
                />
                <CustomInput
                  label="Odometer Out (km)"
                  name="odometerOut"
                  value={formik.values.odometerOut}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Filled at delivery"
                  error={
                    formik.touched.odometerOut && formik.errors.odometerOut
                      ? formik.errors.odometerOut
                      : undefined
                  }
                />
              </Grid>

              <CustomTextArea
                label="Complaint / Reason for Visit"
                name="complaint"
                value={formik.values.complaint}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="What the customer reported, e.g. grinding noise when braking"
                rows={3}
              />
              <CustomTextArea
                label="Diagnosis Notes"
                name="diagnosisNotes"
                value={formik.values.diagnosisNotes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Workshop findings after inspection"
                rows={3}
              />
              <CustomTextArea
                label="Internal Notes"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Anything else worth noting"
                rows={2}
              />
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* Section 4: Technicians (create only — managed on the detail page after) */}
        {!isEdit && (
          <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
            <Card.Header pb="0">
              <SectionHeader
                num={4}
                title="Technicians"
                subtitle="Assign technicians now — the first selected becomes the lead"
              />
            </Card.Header>
            <Card.Body>
              <CustomSelect
                label="Assigned Technicians"
                multiple
                placeholder="Select technicians..."
                options={technicianOptions}
                loading={techniciansLoading}
                value={formik.values.technicianIds}
                onChange={(value: string[]) =>
                  formik.setFieldValue("technicianIds", value ?? [])
                }
              />
            </Card.Body>
          </Card.Root>
        )}

        <Flex justify="flex-end" gap="3">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingText="Saving...">
            {isEdit ? "Save Changes" : "Create Job Card"}
          </Button>
        </Flex>
      </Stack>

      <AddVehicleModal
        open={addVehicleOpen}
        onClose={closeAddVehicle}
        clientId={formik.values.clientId}
        onVehicleSaved={handleVehicleSaved}
      />
    </form>
  );
}
