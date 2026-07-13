import { useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui";
import type { SearchComboboxOption } from "@/components/input/SearchCombobox";
import { RouteConstants } from "@/shared/constants/routes";
import {
  useGetAllCustomersQuery,
  useGetVehiclesByClientQuery,
} from "@/features/customers/api/query";
import type { Vehicle } from "@/features/customers/api/service";
import type { ICustomer } from "@/shared/interface/customer";
import { useGetItemListSimpleQuery } from "@/features/items/api";
import type { Item } from "@/shared/interface/item";
import { useCreateInspectionMutation } from "../../api/query";
import type {
  Finding,
  InspectionFormValues,
  InspectionPayload,
} from "./inspection-form.types";

const EMPTY_FINDING: Finding = { component: "", observation: "", status: "" };

const initialValues: InspectionFormValues = {
  clientId: "",
  vehicleId: "",
  technicianName: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  vehicleNumber: "",
  vehicleName: "",
  vehicleColor: "",
  findings: [{ ...EMPTY_FINDING }],
  additionalNotes: "",
  inspectionDate: new Date().toISOString().split("T")[0],
};

const findingSchema = Yup.object().shape({
  component: Yup.string().required("Component is required"),
  status: Yup.string().required("Status is required"),
  observation: Yup.string(),
});

const validationSchema = Yup.object().shape({
  clientId: Yup.string().required("Please select a customer"),
  vehicleId: Yup.string().required("Please select a vehicle"),
  technicianName: Yup.string().required("Technician name is required"),
  inspectionDate: Yup.string().required("Inspection date is required"),
  findings: Yup.array()
    .of(findingSchema)
    .min(1, "At least one finding is required"),
  additionalNotes: Yup.string(),
});

/**
 * All state, data and handlers for the inspection form. The template and its
 * sections consume this — no Formik context, just the returned `formik`.
 */
export function useInspectionForm() {
  const navigate = useNavigate();
  const { mutateAsync: createInspection, isPending: isSubmitting } =
    useCreateInspectionMutation();

  // ── Customer search (debounced) ──────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Component search (debounced, server-side) ────────────────────────────
  const [componentSearch, setComponentSearch] = useState("");
  const componentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({ search: debouncedSearch, limit: 20 });

  // Items catalog powers the findings "Component" combobox — same source the
  // invoice line items search. Searched server-side as the user types
  // (see handleComponentSearch, which debounces the query).
  const { data: itemsData, isLoading: componentsLoading } =
    useGetItemListSimpleQuery({
      page: 1,
      limit: 100,
      search: componentSearch || undefined,
    });

  const formik = useFormik<InspectionFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const payload: InspectionPayload = {
        vehicleId: values.vehicleId,
        technicianName: values.technicianName,
        customerName: values.customerName,
        customerId: values.clientId || undefined,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        generalNotes: values.additionalNotes || undefined,
        inspectionDate: values.inspectionDate,
        findings: values.findings,
      };
      const response = await createInspection(payload);
      const created = (response?.data ?? response) as { id?: string };
      if (created?.id) {
        navigate(
          RouteConstants.inspection.inspectionDetails.generate({
            id: created.id,
          }),
        );
      } else {
        navigate(RouteConstants.inspection.base.path);
      }
    },
  });

  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(formik.values.clientId);

  const customers: ICustomer[] = useMemo(
    () => customersData?.data ?? [],
    [customersData],
  );
  const vehicles: Vehicle[] = useMemo(
    () => vehiclesData?.data ?? vehiclesData ?? [],
    [vehiclesData],
  );

  // Keep the selected customer in the options even when it isn't in the latest
  // search results — otherwise the combobox loses its label (and looks cleared)
  // once the search resets after selection.
  const customerOptions = useMemo<SearchComboboxOption[]>(() => {
    const opts: SearchComboboxOption[] = customers.map((c) => ({
      label: c.displayName,
      value: c.id,
      subLabel: c.phone ?? c.email ?? undefined,
    }));
    const selectedId = formik.values.clientId;
    if (selectedId && !opts.some((o) => o.value === selectedId)) {
      opts.unshift({
        label: formik.values.customerName || "Selected customer",
        value: selectedId,
        subLabel:
          formik.values.customerPhone ||
          formik.values.customerEmail ||
          undefined,
      });
    }
    return opts;
  }, [
    customers,
    formik.values.clientId,
    formik.values.customerName,
    formik.values.customerPhone,
    formik.values.customerEmail,
  ]);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.year} ${v.make} ${v.model}`,
    value: v.id,
    subLabel: v.registrationNumber,
  }));

  // Findings store the component name (a free-text string), so the option value
  // is the item name itself — selecting fills the name, and any typed value that
  // isn't in the catalog is kept as-is (users can't create catalog items here).
  const componentOptions = useMemo<SearchComboboxOption[]>(() => {
    const items: Item[] = itemsData?.data ?? [];
    return items.map((item) => ({
      label: item.name,
      value: item.name,
      subLabel: item.code || undefined,
    }));
  }, [itemsData]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === formik.values.vehicleId),
    [vehicles, formik.values.vehicleId],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCustomerSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(query), 400);
  };

  const handleComponentSearch = (query: string) => {
    if (componentDebounceRef.current)
      clearTimeout(componentDebounceRef.current);
    componentDebounceRef.current = setTimeout(
      () => setComponentSearch(query),
      800,
    );
  };

  const clearVehicleFields = () => {
    void formik.setFieldValue("vehicleId", "");
    void formik.setFieldValue("vehicleNumber", "");
    void formik.setFieldValue("vehicleName", "");
    void formik.setFieldValue("vehicleColor", "");
  };

  const applyVehicle = (vehicle: Vehicle) => {
    void formik.setFieldValue("vehicleId", vehicle.id);
    void formik.setFieldValue("vehicleNumber", vehicle.registrationNumber);
    void formik.setFieldValue(
      "vehicleName",
      `${vehicle.make} ${vehicle.model}`,
    );
    void formik.setFieldValue("vehicleColor", vehicle.color ?? "");
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    void formik.setFieldValue("clientId", customerId);
    clearVehicleFields();
    if (customer) {
      void formik.setFieldValue("customerName", customer.displayName);
      void formik.setFieldValue("customerEmail", customer.email ?? "");
      void formik.setFieldValue("customerPhone", customer.phone ?? "");
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) applyVehicle(vehicle);
  };

  const handleNewCustomerSaved = (customer: ICustomer) => {
    void formik.setFieldValue("clientId", customer.id);
    void formik.setFieldValue("customerName", customer.displayName);
    void formik.setFieldValue("customerEmail", customer.email ?? "");
    void formik.setFieldValue("customerPhone", customer.phone ?? "");
    clearVehicleFields();
    setAddCustomerOpen(false);
  };

  const handleNewVehicleSaved = (vehicle: Vehicle) => {
    applyVehicle(vehicle);
    setAddVehicleOpen(false);
  };

  // ── Findings ─────────────────────────────────────────────────────────────
  const addFinding = () => {
    const findings = formik.values.findings;
    const last = findings[findings.length - 1];
    if (!last?.component || !last?.status) {
      toaster.create({
        description:
          "Please complete the component and status for the current finding before adding another.",
        type: "error",
      });
      return;
    }
    void formik.setFieldValue("findings", [...findings, { ...EMPTY_FINDING }]);
  };

  const removeFinding = (index: number) => {
    void formik.setFieldValue(
      "findings",
      formik.values.findings.filter((_, i) => i !== index),
    );
  };

  return {
    formik,
    isSubmitting,
    // customer / vehicle
    customerOptions,
    vehicleOptions,
    componentOptions,
    componentsLoading,
    handleComponentSearch,
    customersLoading,
    vehiclesLoading,
    selectedVehicle,
    handleCustomerSearch,
    handleCustomerSelect,
    handleVehicleSelect,
    handleNewCustomerSaved,
    handleNewVehicleSaved,
    addCustomerOpen,
    setAddCustomerOpen,
    addVehicleOpen,
    setAddVehicleOpen,
    // findings
    addFinding,
    removeFinding,
  };
}

export type InspectionFormApi = ReturnType<typeof useInspectionForm>;
