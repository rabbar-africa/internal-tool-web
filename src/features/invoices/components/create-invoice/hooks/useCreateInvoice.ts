import { useFormik, type FormikErrors } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { toaster } from "@/components/ui";
import {
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useGetInvoiceByIdQuery,
} from "../../../api/query";
import { RouteConstants } from "@/shared/constants/routes";
import type { Item } from "@/shared/interface/item";
import type { ICustomer } from "@/shared/interface/customer";
import {
  InvoiceStatusDto,
  type CreateInvoiceFormValues,
  type CreateInvoicePayload,
  type DiscountType,
  type IInvoiceResponse,
  type LineItemFormRow,
} from "@/shared/interface/invoice";
import { useGetItemListSimpleQuery } from "@/features/items/api";
import { useGetOrganizationTaxes } from "@/features/settings/api";
import {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useGetVehiclesByClientQuery,
} from "@/features/customers/api";
import { useGetJobCardByIdQuery } from "@/features/job-cards/api";
import type { Vehicle } from "@/features/customers/api/service";
import { useInvoiceCarryForward } from "./useInvoiceCarryForward";
import {
  calcInvoiceSummary,
  NEGATIVE_TOTAL_MESSAGE,
} from "../../../utils/invoice-summary";
import {
  useGetOrganizationTransactionSeries,
  useGetOrganizationDetails,
} from "@/features/settings/api";
import { formatTransactionSeries } from "@/utils/string-formatter";
import { accountFieldForSave } from "@/features/settings/components/account-details/AccountSelect";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import {
  addDays,
  termsFromDates,
} from "@/features/invoices/utils/payment-terms";
import {
  useCreateQuotationMutation,
  useGetQuotationByIdQuery,
  useUpdateQuotationMutation,
} from "@/features/quotations/api/query";
import type {
  CreateQuotationPayload,
  IQuotation,
} from "@/shared/interface/quotation";

const today = new Date().toISOString().split("T")[0];

/**
 * Tax is no longer a hand-written adjustment: the invoice carries a `taxId`
 * from the organization's taxes and the backend charges it once, after
 * discounts, freezing the rate onto the invoice.
 */

// Generated once per session
export const DEFAULT_INVOICE_PREFIX = "RINV-";
export const DEFAULT_INVOICE_NEXT = String(
  Math.floor(Math.random() * 900000 + 100000),
);

export const EMPTY_LINE_ITEM: LineItemFormRow = {
  itemId: "",
  name: "",
  description: "",
  quantity: "1",
  rate: "0",
  discount: "0%",
  unit: "",
};

const defaultValues: CreateInvoiceFormValues = {
  invoiceNumber: `${DEFAULT_INVOICE_PREFIX}${DEFAULT_INVOICE_NEXT}`,
  customerId: "",
  vehicleId: "",
  customer: { name: "", email: "" },
  referenceNumber: "",
  date: today,
  dueDate: today,
  notes: "Thanks for doing business with us.",
  terms: "",
  discount: "0",
  discountType: "entityLevel",
  taxId: "",
  bankAccountId: "",
  templateId: "",
  adjustment: "",
  adjustmentDescription: "Adjustment",
  isDiscountBeforeTax: true,
  lineItems: [{ ...EMPTY_LINE_ITEM }],
  status: InvoiceStatusDto.SENT,
};

// Maps an invoice fetched from the API back onto the create-invoice form
// shape so the same form components can be reused for editing.
export function mapInvoiceToFormValues(
  invoice: IInvoiceResponse,
): CreateInvoiceFormValues {
  return {
    invoiceNumber: invoice.invoiceNumber ?? "",
    customerId: invoice.customerId ?? "",
    vehicleId: invoice.vehicleId ?? "",
    taxId: invoice.taxId ?? "",
    bankAccountId: invoice.bankAccountId ?? "",
    templateId: invoice.templateId ?? "",
    customer: {
      name: invoice.customerName ?? invoice.client?.displayName ?? "",
      email: invoice.client?.email ?? "",
    },
    referenceNumber: invoice.referenceNumber ?? "",
    date: invoice.date ? invoice.date.split("T")[0] : today,
    dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : today,
    notes: invoice.notes ?? "",
    terms: invoice.terms ?? "",
    discount: invoice.discount ?? "0",
    discountType: (invoice.discountType as DiscountType) || "entityLevel",
    adjustment: invoice.adjustment ?? "",
    adjustmentDescription: invoice.adjustmentDescription ?? "Adjustment",
    isDiscountBeforeTax: invoice.isDiscountBeforeTax ?? true,
    lineItems: (invoice.lineItems ?? []).map((li) => ({
      id: li.id,
      itemId: li.itemId ?? "",
      name: li.name ?? "",
      description: li.description ?? "",
      quantity: String(li.quantity ?? "1"),
      rate: String(li.rate ?? "0"),
      discount: li.discount ?? "0%",
      unit: li.unit != null ? String(li.unit) : "",
    })),
    status:
      (invoice.status?.toUpperCase() as InvoiceStatusDto) ||
      InvoiceStatusDto.SENT,
  };
}

/** Days a new quote is valid for, as the API defaults it. */
export const DEFAULT_QUOTE_VALIDITY_DAYS = 30;

/**
 * A quote in the same form shape. A quote has no due date, so `dueDate`
 * holds its "Valid until" date, with "" for a quote that never expires.
 */
export function mapQuotationToFormValues(
  quote: IQuotation,
): CreateInvoiceFormValues {
  return {
    invoiceNumber: quote.quotationNumber ?? "",
    customerId: quote.customerId ?? "",
    vehicleId: quote.vehicleId ?? "",
    taxId: quote.taxId ?? "",
    bankAccountId: "",
    templateId: quote.templateId ?? "",
    customer: {
      name: quote.customerName ?? quote.client?.displayName ?? "",
      email: quote.client?.email ?? "",
    },
    referenceNumber: quote.referenceNumber ?? "",
    date: quote.date ? quote.date.split("T")[0] : today,
    dueDate: quote.expiryDate ? quote.expiryDate.split("T")[0] : "",
    notes: quote.notes ?? "",
    terms: quote.terms ?? "",
    discount: quote.discount ?? "0",
    discountType: (quote.discountType as DiscountType) || "entityLevel",
    adjustment: quote.adjustment ?? "",
    adjustmentDescription: quote.adjustmentDescription ?? "Adjustment",
    isDiscountBeforeTax: quote.isDiscountBeforeTax ?? true,
    lineItems: (quote.lineItems ?? []).map((li) => ({
      id: li.id,
      itemId: li.itemId ?? "",
      name: li.name ?? "",
      description: li.description ?? "",
      quantity: String(li.quantity ?? "1"),
      rate: String(li.rate ?? "0"),
      discount: li.discount ?? "0%",
      unit: li.unit ?? "",
    })),
    // Not sent for quotes: their status moves only through the quote's buttons.
    status: InvoiceStatusDto.DRAFT,
  };
}

const quoteDefaultValues: CreateInvoiceFormValues = {
  ...defaultValues,
  dueDate: addDays(today, DEFAULT_QUOTE_VALIDITY_DAYS) ?? "",
  // Empty prints the standard quote wording; the invoice terms say payment is due.
  terms: "",
  status: InvoiceStatusDto.DRAFT,
};

const validationSchema = Yup.object({
  invoiceNumber: Yup.string().required("Invoice number is required"),
  customerId: Yup.string().required("Customer is required"),
  date: Yup.string().required("Invoice date is required"),
  dueDate: Yup.string().required("Due date is required"),
  lineItems: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().required("Item name is required"),
        description: Yup.string().optional(),
        quantity: Yup.string().required("Required"),
        rate: Yup.string().required("Required"),
      }),
    )
    .min(1, "Add at least one line item")
    .required(),
});

/** As the invoice's, but "Valid until" may be empty: the quote never expires. */
const quoteValidationSchema = validationSchema.shape({
  invoiceNumber: Yup.string().required("Quote number is required"),
  date: Yup.string().required("Quote date is required"),
  dueDate: Yup.string().optional(),
});

/** The first thing stopping the invoice saving, in the order the form reads. */
function firstInvoiceError(
  errors: FormikErrors<CreateInvoiceFormValues>,
): string | undefined {
  const field =
    errors.customerId ?? errors.invoiceNumber ?? errors.date ?? errors.dueDate;
  if (field) return field;

  const { lineItems } = errors;
  if (!lineItems) return undefined;
  if (typeof lineItems === "string") return lineItems;

  const rows = lineItems as (FormikErrors<LineItemFormRow> | undefined)[];
  // Every row has an error: nothing has been entered yet, not one bad row.
  if (rows.length && rows.every((row) => row?.name)) {
    return "Add at least one item to the invoice";
  }
  const index = rows.findIndex(Boolean);
  const row = rows[index];
  const message = row?.name ?? row?.quantity ?? row?.rate ?? row?.description;
  return message ? `Item ${index + 1}: ${message}` : undefined;
}

export interface UseInvoiceFormOptions {
  mode?: "create" | "edit";
  /**
   * What the form makes. A quote has the invoice's fields less the money ones
   * (due date, payment terms, bank account, old balances), and `dueDate`
   * holds its "Valid until" date.
   */
  document?: "invoice" | "quotation";
}

export function useCreateInvoice(options?: UseInvoiceFormOptions) {
  const mode = options?.mode ?? "create";
  const isEdit = mode === "edit";
  const isQuote = options?.document === "quotation";
  const { id = "" } = useParams<{ id: string }>();
  // Present when arriving from a job card's invoice tab — links on create.
  const [searchParams] = useSearchParams();
  const jobCardId = searchParams.get("jobCardId") ?? "";

  const navigate = useNavigate();
  const { hasFeature } = usePlanAccess();
  const canUseDefaultVat = hasFeature("defaultVat");
  const canUseTerms = hasFeature("invoiceTerms");
  const { mutateAsync, isPending: isCreating } = useCreateInvoiceMutation();
  const { mutateAsync: updateAsync, isPending: isUpdating } =
    useUpdateInvoiceMutation();
  const { mutateAsync: createQuoteAsync, isPending: isCreatingQuote } =
    useCreateQuotationMutation();
  const { mutateAsync: updateQuoteAsync, isPending: isUpdatingQuote } =
    useUpdateQuotationMutation();

  // Only fetched in edit mode (query is disabled when id is empty).
  const invoiceQuery = useGetInvoiceByIdQuery(isEdit && !isQuote ? id : "");
  const quoteQuery = useGetQuotationByIdQuery(isEdit && isQuote ? id : "");
  // Whichever document this form edits.
  const documentQuery = isQuote ? quoteQuery : invoiceQuery;

  // Item search with debounce (server-side, mirrors the customer search below).
  const [debouncedItemSearch, setDebouncedItemSearch] = useState("");
  const itemSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleItemSearch = useCallback((query: string) => {
    if (itemSearchTimerRef.current) clearTimeout(itemSearchTimerRef.current);
    itemSearchTimerRef.current = setTimeout(() => {
      setDebouncedItemSearch(query);
    }, 400);
  }, []);

  const itemsQuery = useGetItemListSimpleQuery({
    page: 1,
    limit: 50,
    ...(debouncedItemSearch ? { search: debouncedItemSearch } : {}),
  });
  const itemsData = useMemo(
    () => itemsQuery?.data?.data || [],
    [itemsQuery?.data?.data],
  );

  // Customer search with debounce
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCustomerSearch = useCallback((query: string) => {
    setCustomerSearch(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(query);
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (itemSearchTimerRef.current) clearTimeout(itemSearchTimerRef.current);
    };
  }, []);

  const customersQuery = useGetAllCustomersQuery({
    page: 1,
    limit: 30,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const customerArray: ICustomer[] = useMemo(
    () => customersQuery?.data?.data || [],
    [customersQuery?.data?.data],
  );

  const formik = useFormik<CreateInvoiceFormValues>({
    initialValues: isQuote ? quoteDefaultValues : defaultValues,
    validationSchema: isQuote ? quoteValidationSchema : validationSchema,
    onSubmit: async (values) => {
      if (isQuote) {
        const quotePayload: CreateQuotationPayload = {
          quotationNumber: values.invoiceNumber,
          referenceNumber: values.referenceNumber,
          customerId: values.customerId,
          vehicleId: values.vehicleId || null,
          taxId: values.taxId || null,
          templateId: values.templateId || null,
          customer: values.customer,
          date: values.date,
          // Empty: the quote never expires.
          expiryDate: values.dueDate || null,
          notes: values.notes,
          terms: values.terms,
          lineItems: values.lineItems.map((li, idx) => ({
            itemOrder: idx + 1,
            ...(li.itemId ? { itemId: li.itemId } : {}),
            name: li.name,
            description: li.description,
            rate: li.rate,
            quantity: li.quantity,
            discount: li.discount,
            ...(li.unit ? { unit: li.unit } : {}),
          })),
          isDiscountBeforeTax: values.isDiscountBeforeTax,
          discount: values.discount,
          discountType: values.discountType,
          adjustment: values.adjustment,
          adjustmentDescription: values.adjustmentDescription,
          ...(!isEdit && jobCardId ? { jobCardId } : {}),
        };
        if (isEdit) {
          await updateQuoteAsync({ id, payload: quotePayload });
          navigate(RouteConstants.quotations.detail.generate({ id }));
          return;
        }
        const created = await createQuoteAsync(quotePayload);
        navigate(
          RouteConstants.quotations.detail.generate({
            id: created?.data?.id ?? "",
          }),
        );
        return;
      }

      const terms = termsFromDates(values.date, values.dueDate);

      const payload: CreateInvoicePayload = {
        invoiceNumber: values.invoiceNumber,
        referenceNumber: values.referenceNumber,
        customerId: values.customerId,
        ...(values.vehicleId
          ? { vehicleId: values.vehicleId }
          : { vehicleId: null }),
        // null clears the tax on update; the backend rejects a taxId here
        // together with per-line taxIds.
        taxId: values.taxId || null,
        bankAccountId: accountFieldForSave(
          values.bankAccountId,
          isEdit
            ? { original: invoiceQuery.data?.data?.bankAccountId }
            : undefined,
        ),
        templateId: values.templateId || null,
        customer: values.customer,
        date: values.date,
        dueDate: values.dueDate,
        paymentTerms: terms.days,
        paymentTermsLabel: terms.label,
        notes: values.notes,
        terms: values.terms,
        lineItems: values.lineItems.map((li, idx) => ({
          itemOrder: idx + 1,
          // Sent so a renamed item keeps its recorded costs; without it the
          // API matches by name and reads a rename as remove plus add.
          ...(li.id ? { id: li.id } : {}),
          ...(li.itemId ? { itemId: li.itemId } : {}),
          name: li.name,
          description: li.description,
          rate: li.rate,
          quantity: li.quantity,
          discount: li.discount,
          ...(li.unit ? { unit: li.unit } : {}),
        })),
        isDiscountBeforeTax: values.isDiscountBeforeTax,
        discount: values.discount,
        discountType: values.discountType,
        adjustment: values.adjustment,
        adjustmentDescription: values.adjustmentDescription,
        status: values.status,
        ...(!isEdit && jobCardId ? { jobCardId } : {}),
      };

      if (isEdit) {
        await updateAsync({ id, payload });
        navigate(RouteConstants.invoices.detail.generate({ id }));
        return;
      }

      const carry = carryRef.current;

      // Re-submitting after a partial failure: the invoice is already saved, so
      // only retry the links that were rejected.
      if (createdInvoiceIdRef.current) {
        const retryId = createdInvoiceIdRef.current;
        const failures = await carry?.flush(
          retryId,
          carry.flushFailures.map((f) => f.invoice),
        );
        if (failures?.length) return;
        navigate(RouteConstants.invoices.detail.generate({ id: retryId }));
        return;
      }

      const response = await mutateAsync(payload);
      const newInvoiceId = response?.data?.id ?? "";

      // Carry links can only be written once the invoice has an id. A rejection
      // here leaves a saved invoice with missing links rather than failing the
      // whole create, so stay on the form and let the user retry or move on.
      const failures = await carry?.flush(newInvoiceId);
      if (failures?.length) {
        createdInvoiceIdRef.current = newInvoiceId;
        return;
      }

      navigate(RouteConstants.invoices.detail.generate({ id: newInvoiceId }));
    },
  });

  // Formik stays silent when validation fails, and the inline errors can be a
  // long way from the button, so say what's wrong.
  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const fieldError = firstInvoiceError(await formik.validateForm());
    const isTotalNegative = totals.total < 0;
    const message =
      fieldError ?? (isTotalNegative ? NEGATIVE_TOTAL_MESSAGE : undefined);
    if (message) toaster.create({ description: message, type: "error" });
    // The total isn't a form field, so Formik's validation can't stop this save.
    if (!fieldError && isTotalNegative) return;
    // Also when invalid: it marks the fields touched, showing the inline errors.
    await formik.submitForm();
  };

  // Vehicle query for the selected customer
  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(formik?.values?.customerId ?? "");

  const vehicles: Vehicle[] = useMemo(
    () => vehiclesData?.data ?? vehiclesData ?? [],
    [vehiclesData],
  );

  const vehicleOptions = useMemo(() => {
    return vehicles.map((v) => ({
      label: `${v.year ? `${v.year} ` : ""}${v.make} ${v.model}`,
      value: v.id,
      subLabel: v.registrationNumber
        ? `Plate: ${v.registrationNumber}`
        : undefined,
    }));
  }, [vehicles]);

  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const openAddVehicle = useCallback(() => setAddVehicleOpen(true), []);
  const closeAddVehicle = useCallback(() => setAddVehicleOpen(false), []);
  const handleVehicleSaved = useCallback(
    (vehicle: Vehicle) => {
      formik.setFieldValue("vehicleId", vehicle.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Tax ──────────────────────────────────────────────────────────────────
  // One whole-job tax from the organization's list. The rate shown here is the
  // current one; once saved, the backend freezes it onto the invoice.
  const { data: taxesData } = useGetOrganizationTaxes();
  const taxes = useMemo(
    () => (taxesData?.data ?? []).filter((tax) => tax.isActive),
    [taxesData?.data],
  );
  const selectedTax = useMemo(
    () => taxes.find((tax) => tax.id === formik.values.taxId) ?? null,
    [taxes, formik.values.taxId],
  );

  // New invoices start on the organization's default tax, if the plan includes
  // that (one saved before a downgrade can stay set). Edits keep whatever the
  // invoice was issued with, including none.
  const taxPreselectedRef = useRef(false);
  useEffect(() => {
    if (isEdit || taxPreselectedRef.current || taxes.length === 0) return;
    if (!canUseDefaultVat) return;
    taxPreselectedRef.current = true;
    const defaultTax = taxes.find((tax) => tax.isDefault);
    if (defaultTax && !formik.values.taxId) {
      formik.setFieldValue("taxId", defaultTax.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, taxes, canUseDefaultVat]);

  const [items, setItems] = useState<Item[]>(
    itemsData?.map((item) => ({
      ...item,
      unitPrice: Number(item?.rate),
    })),
  );

  const addNewItem = useCallback((item: Item) => {
    setItems((prev) => [...prev, item]);
  }, []);

  // Cache customers by id so the selected customer persists when search changes
  const [customerCache, setCustomerCache] = useState<Record<string, ICustomer>>(
    {},
  );

  useEffect(() => {
    if (customerArray.length > 0) {
      setCustomerCache((prev) => {
        const next = { ...prev };
        customerArray.forEach((c) => {
          next[c.id] = c;
        });
        return next;
      });
    }
  }, [customerArray]);

  const addNewCustomer = useCallback((customer: ICustomer) => {
    setCustomerCache((prev) => ({ ...prev, [customer.id]: customer }));
  }, []);

  // Default invoice terms come from the organization's general config.
  const { data: orgDetails } = useGetOrganizationDetails();
  const defaultTerms = orgDetails?.data?.config?.invoiceTermsDefault ?? "";

  // Derive the next invoice number from the active INVOICE transaction series.
  const { data: txnSeriesData } = useGetOrganizationTransactionSeries();
  const seriesModule = isQuote ? "ESTIMATE" : "INVOICE";
  const seriesInvoiceNumber = useMemo(() => {
    const invoiceSeries = (txnSeriesData?.data ?? []).find(
      (s) => s.module === seriesModule && s.isActive,
    );
    if (!invoiceSeries) return "";
    return formatTransactionSeries({
      prefix: invoiceSeries.prefix,
      suffix: invoiceSeries.suffix,
      separator: invoiceSeries.separator,
      padding: invoiceSeries.padding,
      number: invoiceSeries.nextNumber,
    });
  }, [txnSeriesData?.data, seriesModule]);

  // `useInvoiceCarryForward` needs the customer id off `formik.values`, so it
  // can only run once the form exists — this ref lets `onSubmit` (which fires
  // long after render) reach back into it.
  const carryRef = useRef<ReturnType<typeof useInvoiceCarryForward> | null>(
    null,
  );
  // Holds the new invoice's id when it saved but some carry links were
  // rejected, so retrying the form links onto it instead of creating a second
  // invoice.
  const createdInvoiceIdRef = useRef("");

  // In edit mode, hydrate the form once the invoice resolves and seed the
  // customer cache so the billing block + combobox label render immediately.
  // The form fills only once, so a cached copy that's being refetched is
  // waited out: filling from it would edit, and save over, an old invoice.
  const [isInvoiceApplied, setIsInvoiceApplied] = useState(false);
  useEffect(() => {
    if (!isEdit || isInvoiceApplied || documentQuery.isFetching) return;
    if (isQuote) {
      const quote = quoteQuery.data?.data;
      if (!quote) return;
      setIsInvoiceApplied(true);
      formik.setValues(mapQuotationToFormValues(quote));
      if (quote.client) {
        const client = quote.client as unknown as ICustomer;
        setCustomerCache((prev) => ({ ...prev, [client.id]: client }));
      }
      return;
    }
    const invoice = invoiceQuery.data?.data;
    if (!invoice) return;
    setIsInvoiceApplied(true);
    formik.setValues(mapInvoiceToFormValues(invoice));
    if (invoice.client) {
      setCustomerCache((prev) => ({
        ...prev,
        [invoice.client.id]: invoice.client,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    invoiceQuery.data,
    quoteQuery.data,
    documentQuery.isFetching,
    isEdit,
    isInvoiceApplied,
  ]);

  // Started from a job card (?jobCardId=) or a customer (?customerId=, and
  // maybe ?vehicleId=): begin on that customer and vehicle, once, and only if
  // nobody has picked a customer yet. A walk-in job card has no saved
  // customer, so there is nothing to fill in.
  const jobCardQuery = useGetJobCardByIdQuery(isEdit ? "" : jobCardId);
  const jobCard = jobCardQuery.data?.data;
  const startCustomerId = isEdit
    ? ""
    : jobCardId
      ? (jobCard?.clientId ?? "")
      : (searchParams.get("customerId") ?? "");
  const startVehicleId = jobCardId
    ? jobCard?.vehicleId
    : searchParams.get("vehicleId");
  const startClientQuery = useGetCustomerByIdQuery(startCustomerId);
  const startClient = startClientQuery.data?.data as ICustomer | undefined;
  const startAppliedRef = useRef(false);
  useEffect(() => {
    if (isEdit || startAppliedRef.current || !startClient) return;
    startAppliedRef.current = true;
    if (formik.values.customerId) return;
    setCustomerCache((prev) => ({ ...prev, [startClient.id]: startClient }));
    formik.setFieldValue("customerId", startClient.id);
    formik.setFieldValue("customer", {
      name: startClient.displayName,
      email: startClient.email ?? "",
    });
    if (startVehicleId) formik.setFieldValue("vehicleId", startVehicleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, startClient]);

  // Quotes hold no money, so they carry no old balances: given no invoice or
  // customer, the hook fetches nothing.
  const carry = useInvoiceCarryForward({
    isEdit: isEdit && !isQuote,
    invoiceId: isEdit && !isQuote ? id : "",
    customerId: isQuote ? "" : formik.values.customerId,
    serverCarried: invoiceQuery.data?.data?.broughtForward ?? [],
  });

  carryRef.current = carry;

  /** Abandons the rejected links and moves on to the saved invoice. */
  const skipCarryFlush = useCallback(() => {
    const savedId = createdInvoiceIdRef.current;
    if (!savedId) return;
    carry.clearFlushFailures();
    navigate(RouteConstants.invoices.detail.generate({ id: savedId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carry.clearFlushFailures]);

  const selectedCustomer = useMemo(
    () => customerCache[formik.values.customerId] ?? null,
    [customerCache, formik.values.customerId],
  );

  const customerOptions = useMemo(() => {
    const opts = customerArray.map((c) => ({
      label: c.displayName,
      value: c.id,
      subLabel: c.email ?? undefined,
    }));
    // Ensure the selected customer is always selectable even when it's not in
    // the current (possibly searched/paginated) result set — e.g. on edit.
    if (
      selectedCustomer &&
      !opts.some((o) => o.value === selectedCustomer.id)
    ) {
      opts.unshift({
        label: selectedCustomer.displayName,
        value: selectedCustomer.id,
        subLabel: selectedCustomer.email ?? undefined,
      });
    }
    return opts;
  }, [customerArray, selectedCustomer]);

  const handleItemSelect = (idx: number, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      formik.setFieldValue(`lineItems.${idx}.itemId`, itemId);
      formik.setFieldValue(`lineItems.${idx}.name`, item.name);
      formik.setFieldValue(
        `lineItems.${idx}.description`,
        item.description ?? "",
      );
      formik.setFieldValue(`lineItems.${idx}.rate`, String(item.unitPrice));
      formik.setFieldValue(`lineItems.${idx}.unit`, item.unit ?? "");
    }
  };

  const addLineItem = () => {
    formik.setFieldValue("lineItems", [
      ...formik.values.lineItems,
      { ...EMPTY_LINE_ITEM },
    ]);
  };

  const removeLineItem = (idx: number) => {
    const newLineItems = formik.values.lineItems.filter((_, i) => i !== idx);
    formik.setFieldValue("lineItems", newLineItems);
  };

  const totals = useMemo(() => {
    const lineItems = formik.values.lineItems ?? [];
    const subtotal = lineItems.reduce((sum, li) => {
      const qty = parseFloat(li.quantity) || 0;
      const rate = parseFloat(li.rate) || 0;
      const discountStr = (li.discount ?? "").replace("%", "");
      const discountPct = parseFloat(discountStr) || 0;
      return sum + qty * rate * (1 - discountPct / 100);
    }, 0);

    const entityDiscount = parseFloat(formik.values.discount) || 0;
    const adjustmentVal = parseFloat(formik.values.adjustment) || 0;
    // One tax, charged on the discounted subtotal.
    const taxRate = selectedTax ? Number(selectedTax.rate) || 0 : 0;
    const { taxVal, total } = calcInvoiceSummary({
      subtotal,
      discount: entityDiscount,
      taxRate,
      adjustment: adjustmentVal,
      isDiscountBeforeTax: formik.values.isDiscountBeforeTax,
    });

    return { subtotal, entityDiscount, taxVal, taxRate, adjustmentVal, total };
  }, [
    formik.values.lineItems,
    formik.values.discount,
    formik.values.adjustment,
    formik.values.isDiscountBeforeTax,
    selectedTax,
  ]);

  const getLineAmount = (li: LineItemFormRow) => {
    const qty = parseFloat(li.quantity) || 0;
    const rate = parseFloat(li.rate) || 0;
    const discountPct = parseFloat((li.discount ?? "").replace("%", "")) || 0;
    return qty * rate * (1 - discountPct / 100);
  };

  // Apply the series-derived invoice number once it resolves, as long as the
  // user hasn't already edited the field away from the default.
  const appliedSeriesRef = useRef(false);
  useEffect(() => {
    if (isEdit || appliedSeriesRef.current || !seriesInvoiceNumber) return;
    appliedSeriesRef.current = true;
    formik.setFieldValue("invoiceNumber", seriesInvoiceNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesInvoiceNumber]);

  // Seed the terms field with the org's default once it resolves, unless the
  // user has already typed their own.
  const appliedTermsRef = useRef(false);
  useEffect(() => {
    if (
      isEdit ||
      isQuote ||
      appliedTermsRef.current ||
      !defaultTerms ||
      !canUseTerms
    )
      return;
    appliedTermsRef.current = true;
    if (!formik.values.terms) formik.setFieldValue("terms", defaultTerms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTerms]);

  const handleCancel = () =>
    navigate(
      isQuote
        ? RouteConstants.quotations.base.path
        : RouteConstants.invoices.base.path,
    );

  useEffect(() => {
    if (itemsData?.length > 0) {
      setItems(
        itemsData?.map((item: Item) => ({
          ...item,
          unitPrice: Number(item?.rate),
        })),
      );
    }
  }, [itemsData]);

  return {
    mode,
    isEdit,
    // Not on an error: the form shows, as before, rather than spinning forever.
    isLoadingInvoice:
      isEdit &&
      !isInvoiceApplied &&
      (documentQuery.isLoading || documentQuery.isFetching),
    /** The quote being edited, for the header's status checks. */
    quote: isQuote ? quoteQuery.data?.data : undefined,
    formik,
    handleSubmit,
    addLineItem,
    removeLineItem,
    customerOptions,
    selectedCustomer,
    handleItemSelect,
    totals,
    taxes,
    selectedTax,
    getLineAmount,
    isPending: isQuote
      ? isCreatingQuote || isUpdatingQuote
      : isEdit
        ? isUpdating
        : isCreating || carry.isFlushing,
    handleCancel,

    // Carry-forward ("bring past unpaid balance")
    carry,
    skipCarryFlush,
    items,
    addNewItem,
    addNewCustomer,
    customerSearch,
    handleCustomerSearch,
    isSearchingCustomers: customersQuery.isFetching,
    itemsData: itemsQuery?.data?.data || [],
    handleItemSearch,
    isSearchingItems: itemsQuery.isFetching,

    // Vehicle properties
    vehicleOptions,
    vehiclesLoading,
    addVehicleOpen,
    openAddVehicle,
    closeAddVehicle,
    handleVehicleSaved,
  };
}
