import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCreateInvoiceMutation } from "../../../api/query";
import { RouteConstants } from "@/shared/constants/routes";
import type { Item } from "@/shared/interface/item";
import type { ICustomer } from "@/shared/interface/customer";
import type { CreateInvoicePayload } from "@/shared/interface/invoice";
import { useGetItemListSimpleQuery } from "@/features/items/api";
import { useGetAllCustomersQuery } from "@/features/customers/api";
import { useGetOrganizationTransactionSeries } from "@/features/settings/api";
import { formatTransactionSeries } from "@/utils/string-formatter";

export interface LineItemFormRow {
  itemId: string;
  name: string;
  description: string;
  quantity: string;
  rate: string;
  discount: string;
  unit: string;
}

export interface CreateInvoiceFormValues {
  invoiceNumber: string;
  customerId: string;
  customer: {
    name: string;
    email: string;
  };
  referenceNumber: string;
  date: string;
  dueDate: string;
  paymentTerms: string;
  paymentTermsLabel: string;
  notes: string;
  terms: string;
  discount: string;
  discountType: "entityLevel" | "itemLevel";
  adjustment: string;
  adjustmentDescription: string;
  isDiscountBeforeTax: boolean;
  lineItems: LineItemFormRow[];
}

const today = new Date().toISOString().split("T")[0];

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
  customer: { name: "", email: "" },
  referenceNumber: "",
  date: today,
  dueDate: today,
  paymentTerms: "0",
  paymentTermsLabel: "Due on Receipt",
  notes: "Thanks for doing business with us.",
  terms: "",
  discount: "0",
  discountType: "entityLevel",
  adjustment: "",
  adjustmentDescription: "Adjustment",
  isDiscountBeforeTax: true,
  lineItems: [{ ...EMPTY_LINE_ITEM }],
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

export const PAYMENT_TERMS_OPTIONS = [
  { label: "Due on Receipt", value: "0" },
  { label: "Net 15", value: "15" },
  { label: "Net 30", value: "30" },
  { label: "Net 45", value: "45" },
  { label: "Net 60", value: "60" },
];

export function useCreateInvoice() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateInvoiceMutation();
  const itemsQuery = useGetItemListSimpleQuery({ page: 1, limit: 1000 });
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

  // Derive the next invoice number from the active INVOICE transaction series.
  const { data: txnSeriesData } = useGetOrganizationTransactionSeries();
  const seriesInvoiceNumber = useMemo(() => {
    const invoiceSeries = (txnSeriesData?.data ?? []).find(
      (s) => s.module === "INVOICE" && s.isActive,
    );
    if (!invoiceSeries) return "";
    return formatTransactionSeries({
      prefix: invoiceSeries.prefix,
      suffix: invoiceSeries.suffix,
      separator: invoiceSeries.separator,
      padding: invoiceSeries.padding,
      number: invoiceSeries.nextNumber,
    });
  }, [txnSeriesData?.data]);

  const formik = useFormik<CreateInvoiceFormValues>({
    initialValues: defaultValues,
    validationSchema,
    onSubmit: async (values) => {
      const termsLabel =
        PAYMENT_TERMS_OPTIONS.find((o) => o.value === values.paymentTerms)
          ?.label ?? "Due on Receipt";

      const payload: CreateInvoicePayload = {
        invoiceNumber: values.invoiceNumber,
        referenceNumber: values.referenceNumber,
        customerId: values.customerId,
        customer: values.customer,
        date: values.date,
        dueDate: values.dueDate,
        paymentTerms: parseInt(values.paymentTerms) || 0,
        paymentTermsLabel: termsLabel,
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
      };

      // console.log("payload is ", payload);

      await mutateAsync(payload);
      navigate(RouteConstants.invoices.base.path);
    },
  });

  const customerOptions = useMemo(
    () =>
      customerArray.map((c) => ({
        label: c.displayName,
        value: c.id,
        subLabel: c.email ?? undefined,
      })),
    [customerArray],
  );

  const selectedCustomer = useMemo(
    () => customerCache[formik.values.customerId] ?? null,
    [customerCache, formik.values.customerId],
  );

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
    const total = subtotal - entityDiscount + adjustmentVal;

    return { subtotal, entityDiscount, adjustmentVal, total };
  }, [
    formik.values.lineItems,
    formik.values.discount,
    formik.values.adjustment,
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
    if (appliedSeriesRef.current || !seriesInvoiceNumber) return;
    appliedSeriesRef.current = true;
    formik.setFieldValue("invoiceNumber", seriesInvoiceNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesInvoiceNumber]);

  const handleCancel = () => navigate(RouteConstants.invoices.base.path);

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
    items,
    addNewItem,
    addNewCustomer,
    customerSearch,
    handleCustomerSearch,
    isSearchingCustomers: customersQuery.isFetching,
    itemsData: itemsQuery?.data?.data || [],
  };
}
