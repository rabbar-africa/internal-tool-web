import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import {
  SearchCombobox,
  type SearchComboboxOption,
} from "@/components/input/SearchCombobox";
import { useGetAllCustomersQuery } from "@/features/customers/api/query";
import { useGetVehiclesByClientQuery } from "@/features/customers/api/query";
import type { Vehicle } from "@/features/customers/api/service";
import { AddVehicleModal } from "@/features/customers/components/customer-detail/AddVehicleModal";
import { useGetTechniciansQuery } from "@/features/technicians/api/query";
import { technicianFullName } from "@/shared/interface/technician";
import {
  JOB_CARD_PRIORITY_OPTIONS,
  JOB_CARD_STATUS_OPTIONS,
  type CreateJobCardPayload,
  type JobCardDetail,
  type JobCardPriority,
  type JobCardStatus,
} from "@/shared/interface/job-card";

interface JobCardFormProps {
  /** Existing job card when editing; omit to create. */
  jobCard?: JobCardDetail;
  isSubmitting: boolean;
  onSubmit: (payload: CreateJobCardPayload) => Promise<void>;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  clientId: Yup.string(),
  customerName: Yup.string().when("clientId", {
    is: (clientId: string) => !clientId,
    then: (schema) =>
      schema.required("Select a customer or enter a customer name"),
    otherwise: (schema) => schema,
  }),
  vehicleYear: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Year must be a number")
    .integer("Year must be a whole number")
    .min(1950, "Enter a valid year")
    .max(new Date().getFullYear() + 1, "Enter a valid year"),
  odometerIn: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Odometer must be a number")
    .min(0, "Odometer cannot be negative"),
  odometerOut: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Odometer must be a number")
    .min(0, "Odometer cannot be negative"),
});

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
  const isEdit = Boolean(jobCard);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  // SearchCombobox debounces onSearchChange for us, so query on it directly.
  const [customerSearch, setCustomerSearch] = useState("");
  const { data: customersData, isFetching: isSearchingCustomers } =
    useGetAllCustomersQuery({
      limit: 30,
      ...(customerSearch ? { search: customerSearch } : {}),
    });
  const { data: techniciansData, isLoading: techniciansLoading } =
    useGetTechniciansQuery({ limit: 100, isActive: "true" });

  const formik = useFormik({
    initialValues: {
      clientId: jobCard?.clientId ?? "",
      customerName: jobCard?.customerName ?? "",
      customerPhone: jobCard?.customerPhone ?? "",
      vehicleId: jobCard?.vehicleId ?? "",
      vehicleMake: jobCard?.vehicleMake ?? "",
      vehicleModel: jobCard?.vehicleModel ?? "",
      vehicleYear: jobCard?.vehicleYear ? String(jobCard.vehicleYear) : "",
      vehicleRegistrationNumber: jobCard?.vehicleRegistrationNumber ?? "",
      status: (jobCard?.status ?? "OPEN") as JobCardStatus,
      priority: (jobCard?.priority ?? "NORMAL") as JobCardPriority,
      complaint: jobCard?.complaint ?? "",
      diagnosisNotes: jobCard?.diagnosisNotes ?? "",
      notes: jobCard?.notes ?? "",
      odometerIn: jobCard?.odometerIn != null ? String(jobCard.odometerIn) : "",
      odometerOut:
        jobCard?.odometerOut != null ? String(jobCard.odometerOut) : "",
      promisedDate: jobCard?.promisedDate
        ? jobCard.promisedDate.slice(0, 10)
        : "",
      technicianIds: [] as string[],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const payload: CreateJobCardPayload = {
        clientId: values.clientId || (isEdit ? null : undefined),
        customerName: values.customerName || undefined,
        customerPhone: values.customerPhone || undefined,
        vehicleId: values.vehicleId || (isEdit ? null : undefined),
        vehicleMake: values.vehicleMake || undefined,
        vehicleModel: values.vehicleModel || undefined,
        vehicleYear: values.vehicleYear
          ? Number(values.vehicleYear)
          : undefined,
        vehicleRegistrationNumber:
          values.vehicleRegistrationNumber || undefined,
        status: values.status,
        priority: values.priority,
        complaint: values.complaint || undefined,
        diagnosisNotes: values.diagnosisNotes || undefined,
        notes: values.notes || undefined,
        odometerIn: values.odometerIn ? Number(values.odometerIn) : undefined,
        odometerOut: values.odometerOut
          ? Number(values.odometerOut)
          : undefined,
        promisedDate: values.promisedDate || undefined,
        ...(isEdit
          ? {}
          : values.technicianIds.length > 0
            ? { technicianIds: values.technicianIds }
            : {}),
      };
      await onSubmit(payload);
    },
  });

  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(formik.values.clientId);

  const customerOptions = useMemo<SearchComboboxOption[]>(() => {
    const options: SearchComboboxOption[] = (customersData?.data ?? []).map(
      (customer) => ({
        label: customer.displayName,
        value: customer.id,
        subLabel: customer.phone ?? undefined,
      }),
    );
    // Keep the currently-selected customer visible even when it isn't in the
    // latest search results (e.g. when editing a saved job card).
    const selectedId = formik.values.clientId;
    if (selectedId && !options.some((o) => o.value === selectedId)) {
      options.unshift({
        label: formik.values.customerName || "Selected customer",
        value: selectedId,
        subLabel: formik.values.customerPhone || undefined,
      });
    }
    return options;
  }, [
    customersData?.data,
    formik.values.clientId,
    formik.values.customerName,
    formik.values.customerPhone,
  ]);

  const vehicles = useMemo<Vehicle[]>(
    () => vehiclesData?.data ?? vehiclesData ?? [],
    [vehiclesData],
  );
  const vehicleOptions = useMemo<SearchComboboxOption[]>(() => {
    const options: SearchComboboxOption[] = vehicles.map((vehicle) => ({
      label: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
      value: vehicle.id,
      subLabel: vehicle.registrationNumber,
    }));
    // Keep a just-selected/created vehicle visible before the list refetches.
    const selectedId = formik.values.vehicleId;
    if (selectedId && !options.some((o) => o.value === selectedId)) {
      options.unshift({
        label: `${formik.values.vehicleMake} ${formik.values.vehicleModel} (${formik.values.vehicleYear})`,
        value: selectedId,
        subLabel: formik.values.vehicleRegistrationNumber || undefined,
      });
    }
    return options;
  }, [
    vehicles,
    formik.values.vehicleId,
    formik.values.vehicleMake,
    formik.values.vehicleModel,
    formik.values.vehicleYear,
    formik.values.vehicleRegistrationNumber,
  ]);

  const technicianOptions = (techniciansData?.data ?? []).map((technician) => ({
    label: technicianFullName(technician),
    value: technician.id,
  }));

  const handleClientChange = (
    clientId: string,
    option: SearchComboboxOption,
  ) => {
    formik.setFieldValue("clientId", clientId);
    formik.setFieldValue("vehicleId", "");
    formik.setFieldValue("customerName", option.label);
    formik.setFieldValue("customerPhone", option.subLabel ?? "");
  };

  // Copy the vehicle's details into the form (kept for the payload) and select it.
  const applyVehicle = (vehicle: Vehicle) => {
    formik.setFieldValue("vehicleId", vehicle.id);
    formik.setFieldValue("vehicleMake", vehicle.make);
    formik.setFieldValue("vehicleModel", vehicle.model);
    formik.setFieldValue("vehicleYear", String(vehicle.year));
    formik.setFieldValue(
      "vehicleRegistrationNumber",
      vehicle.registrationNumber,
    );
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) applyVehicle(vehicle);
    else formik.setFieldValue("vehicleId", vehicleId);
  };

  const handleVehicleSaved = (vehicle: Vehicle) => {
    applyVehicle(vehicle);
    setAddVehicleOpen(false);
  };

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
                  onClick: () => setAddVehicleOpen(true),
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
        onClose={() => setAddVehicleOpen(false)}
        clientId={formik.values.clientId}
        onVehicleSaved={handleVehicleSaved}
      />
    </form>
  );
}
