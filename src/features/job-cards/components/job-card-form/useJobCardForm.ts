import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { SearchComboboxOption } from "@/components/input/SearchCombobox";
import {
  useGetAllCustomersQuery,
  useGetVehiclesByClientQuery,
} from "@/features/customers/api/query";
import type { Vehicle } from "@/features/customers/api/service";
import { useGetTechniciansQuery } from "@/features/technicians/api/query";
import { technicianFullName } from "@/shared/interface/technician";
import type {
  JobCardDetail,
  JobCardFormPayload,
  JobCardPriority,
  JobCardStatus,
} from "@/shared/interface/job-card";

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

interface UseJobCardFormArgs {
  jobCard?: JobCardDetail;
  onSubmit: (payload: JobCardFormPayload) => Promise<void>;
}

/** All state, data and handlers for the job card form — the component is just
 * the markup that consumes this. */
export function useJobCardForm({ jobCard, onSubmit }: UseJobCardFormArgs) {
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
      openedAt: jobCard?.openedAt ? jobCard.openedAt.slice(0, 10) : "",
      promisedDate: jobCard?.promisedDate
        ? jobCard.promisedDate.slice(0, 10)
        : "",
      closedAt: jobCard?.closedAt ? jobCard.closedAt.slice(0, 10) : "",
      technicianIds: [] as string[],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const payload: JobCardFormPayload = {
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
        openedAt: values.openedAt || undefined,
        promisedDate: values.promisedDate || undefined,
        ...(isEdit
          ? values.closedAt
            ? { closedAt: new Date(values.closedAt).toISOString() }
            : {}
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

  const technicianOptions = useMemo(
    () =>
      (techniciansData?.data ?? []).map((technician) => ({
        label: technicianFullName(technician),
        value: technician.id,
      })),
    [techniciansData?.data],
  );

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

  return {
    isEdit,
    formik,
    // customer
    customerOptions,
    isSearchingCustomers,
    setCustomerSearch,
    handleClientChange,
    // vehicle
    vehicleOptions,
    vehiclesLoading,
    handleVehicleChange,
    handleVehicleSaved,
    addVehicleOpen,
    openAddVehicle: () => setAddVehicleOpen(true),
    closeAddVehicle: () => setAddVehicleOpen(false),
    // technicians
    technicianOptions,
    techniciansLoading,
  };
}
