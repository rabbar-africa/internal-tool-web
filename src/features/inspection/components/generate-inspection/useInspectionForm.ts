import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  useCreateInspectionMutation,
  useGetInspectionByIdQuery,
  useUpdateInspectionMutation,
} from "../../api/query";
import type { IInspection } from "@/shared/interface/inspection";
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

// Older inspections may predate the customer link, so the customer selection
// can't be re-validated on edit — only on create.
const buildValidationSchema = (isEdit: boolean) =>
  Yup.object().shape({
    clientId: isEdit
      ? Yup.string()
      : Yup.string().required("Please select a customer"),
    vehicleId: Yup.string().required("Please select a vehicle"),
    technicianName: Yup.string(),
    inspectionDate: Yup.string().required("Inspection date is required"),
    findings: Yup.array()
      .of(findingSchema)
      .min(1, "At least one finding is required"),
    additionalNotes: Yup.string(),
  });

export interface UseInspectionFormOptions {
  mode?: "create" | "edit";
}

/** Quill leaves husks like `<p></p>` / `<p><br></p>` when the editor is empty. */
const isEmptyHtml = (html: string) =>
  html.replace(/<[^>]*>|&nbsp;/g, "").trim() === "";

/**
 * All state, data and handlers for the inspection form. The template and its
 * sections consume this — no Formik context, just the returned `formik`.
 * In edit mode the form hydrates from the inspection in the `:id` route param.
 */
export function useInspectionForm(options?: UseInspectionFormOptions) {
  const mode = options?.mode ?? "create";
  const isEdit = mode === "edit";
  const { id = "" } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const { mutateAsync: createInspection, isPending: isCreating } =
    useCreateInspectionMutation();
  const { mutateAsync: updateInspection, isPending: isUpdating } =
    useUpdateInspectionMutation();
  const isSubmitting = isCreating || isUpdating;

  // Only fetched in edit mode (query is disabled when id is empty).
  const inspectionQuery = useGetInspectionByIdQuery(isEdit ? id : "");

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
      limit: 50,
      search: componentSearch || undefined,
    });

  // Built once per mode — rebuilding the Yup schema on every render makes each
  // keystroke's validation pass needlessly expensive.
  const validationSchema = useMemo(
    () => buildValidationSchema(isEdit),
    [isEdit],
  );

  const formik = useFormik<InspectionFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const payload: InspectionPayload = {
        vehicleId: values.vehicleId,
        technicianName: values.technicianName || undefined,
        customerName: values.customerName,
        customerId: values.clientId || undefined,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        generalNotes: isEmptyHtml(values.additionalNotes)
          ? undefined
          : values.additionalNotes,
        inspectionDate: values.inspectionDate,
        findings: values.findings,
      };

      if (isEdit) {
        await updateInspection({ id, data: payload });
        navigate(RouteConstants.inspection.inspectionDetails.generate({ id }));
        return;
      }

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

  // In edit mode, hydrate the form once the inspection resolves. The customer
  // link (`customerId`) may be missing on older records — the combobox then
  // falls back to the stored customer name via the customerOptions unshift.
  // `hydrated` is state (not a ref) because the template must keep the form
  // unmounted until the values are applied: if ReactQuill mounts empty first,
  // its normalize-on-init onChange ("<p></p>") clobbers the hydrated notes.
  const [hydrated, setHydrated] = useState(false);
  const inspection = (inspectionQuery.data?.data ?? inspectionQuery.data) as
    | IInspection
    | undefined;
  useEffect(() => {
    if (!isEdit || hydrated || !inspection) return;
    void formik.setValues({
      clientId: inspection.customerId ?? "",
      vehicleId: inspection.vehicleId ?? "",
      technicianName: inspection.technicianName ?? "",
      customerName: inspection.customerName ?? "",
      customerEmail: inspection.customerEmail ?? "",
      customerPhone: inspection.customerPhone ?? "",
      vehicleNumber: inspection.vehicleRegistrationNumber ?? "",
      vehicleName: [inspection.vehicleMake, inspection.vehicleModel]
        .filter(Boolean)
        .join(" "),
      vehicleColor: inspection.vehicleColor ?? "",
      findings: inspection.findings?.length
        ? inspection.findings.map((f) => ({
            component: f.component,
            status: f.status,
            observation: f.observation ?? "",
          }))
        : [{ ...EMPTY_FINDING }],
      additionalNotes: inspection.generalNotes ?? "",
      inspectionDate: inspection.inspectionDate
        ? inspection.inspectionDate.split("T")[0]
        : initialValues.inspectionDate,
    });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspection, isEdit, hydrated]);

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

  // Same fallback as customers: keep the selected vehicle in the options even
  // when it isn't in the loaded list (e.g. hydrated on edit before the client's
  // vehicles resolve, or when the customer link is missing on older records).
  const vehicleOptions = useMemo<SearchComboboxOption[]>(() => {
    const opts: SearchComboboxOption[] = vehicles.map((v) => ({
      label: `${v.year} ${v.make} ${v.model}`,
      value: v.id,
      subLabel: v.registrationNumber,
    }));
    const selectedId = formik.values.vehicleId;
    if (selectedId && !opts.some((o) => o.value === selectedId)) {
      opts.unshift({
        label: formik.values.vehicleName || "Selected vehicle",
        value: selectedId,
        subLabel: formik.values.vehicleNumber || undefined,
      });
    }
    return opts;
  }, [
    vehicles,
    formik.values.vehicleId,
    formik.values.vehicleName,
    formik.values.vehicleNumber,
  ]);

  // Findings store the component name (a free-text string), so the option value
  // is the item name itself — selecting fills the name, and any typed value that
  // isn't in the catalog is kept as-is (users can't create catalog items here).
  // The catalog can contain duplicate names ("Alternator" twice) and the name
  // is both the option value and its React key, so dedupe case-insensitively,
  // keeping the first occurrence.
  const componentOptions = useMemo<SearchComboboxOption[]>(() => {
    const items: Item[] = itemsData?.data ?? [];
    const seen = new Set<string>();
    const opts: SearchComboboxOption[] = [];
    for (const item of items) {
      const key = item.name.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      opts.push({
        label: item.name,
        value: item.name,
        subLabel: item.code || undefined,
      });
    }
    return opts;
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

  // Stable identity — passed into memoized finding rows.
  const handleComponentSearch = useCallback((query: string) => {
    if (componentDebounceRef.current)
      clearTimeout(componentDebounceRef.current);
    componentDebounceRef.current = setTimeout(
      () => setComponentSearch(query),
      800,
    );
  }, []);

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
  // These are passed into memoized finding rows, so they must be identity-
  // stable AND always act on the latest values — a ref bridges the two
  // (Formik's setFieldValue is already stable).
  const valuesRef = useRef(formik.values);
  valuesRef.current = formik.values;

  const addFinding = useCallback(() => {
    const findings = valuesRef.current.findings;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.setFieldValue]);

  const removeFinding = useCallback(
    (index: number) => {
      void formik.setFieldValue(
        "findings",
        valuesRef.current.findings.filter((_, i) => i !== index),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik.setFieldValue],
  );

  return {
    formik,
    isSubmitting,
    mode,
    isEdit,
    // Keep the form unmounted until hydration is applied (see the hydration
    // effect); on fetch error, fall through so the user isn't stuck on a loader.
    isLoadingInspection:
      isEdit && !hydrated && !inspectionQuery.isError && !!id,
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
