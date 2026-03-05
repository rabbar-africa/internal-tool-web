import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { useCreateInvoiceMutation } from "../../../api/query";
import { RouteConstants } from "@/shared/constants/routes";
import { MOCK_ITEMS, MOCK_CUSTOMERS } from "@/shared/data/mock";
import type { Item } from "@/shared/interface/item";
import type { Customer } from "@/shared/interface/customer";

export interface LineItemFormRow {
  item_id: string;
  name: string;
  description: string;
  quantity: string;
  rate: string;
  discount: string;
  tax_id: string;
  account_id: string;
  unit: string;
}

export interface CreateInvoiceFormValues {
  invoice_number: string;
  customer_id: string;
  reference_number: string;
  date: string;
  due_date: string;
  payment_terms: string;
  payment_terms_label: string;
  notes: string;
  terms: string;
  discount: string;
  discount_type: "entity_level" | "item_level";
  adjustment: string;
  adjustment_description: string;
  is_discount_before_tax: boolean;
  line_items: LineItemFormRow[];
}

const today = new Date().toISOString().split("T")[0];

// Generated once per session
export const DEFAULT_INVOICE_PREFIX = "RINV-";
export const DEFAULT_INVOICE_NEXT = String(
  Math.floor(Math.random() * 900000 + 100000),
);

export const EMPTY_LINE_ITEM: LineItemFormRow = {
  item_id: "",
  name: "",
  description: "",
  quantity: "1",
  rate: "0",
  discount: "0%",
  tax_id: "",
  account_id: "",
  unit: "",
};

const defaultValues: CreateInvoiceFormValues = {
  invoice_number: `${DEFAULT_INVOICE_PREFIX}${DEFAULT_INVOICE_NEXT}`,
  customer_id: "",
  reference_number: "",
  date: today,
  due_date: today,
  payment_terms: "0",
  payment_terms_label: "Due on Receipt",
  notes: "Thanks for doing business with us.",
  terms: "",
  discount: "0",
  discount_type: "entity_level",
  adjustment: "",
  adjustment_description: "Adjustment",
  is_discount_before_tax: true,
  line_items: [{ ...EMPTY_LINE_ITEM }],
};

const validationSchema = Yup.object({
  invoice_number: Yup.string().required("Invoice number is required"),
  customer_id: Yup.string().required("Customer is required"),
  date: Yup.string().required("Invoice date is required"),
  due_date: Yup.string().required("Due date is required"),
  line_items: Yup.array()
    .of(
      Yup.object({
        description: Yup.string().required("Required"),
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

  // Items list — starts from mock data, extended when user adds new items
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);

  const addNewItem = useCallback((item: Item) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const addNewCustomer = useCallback((customer: Customer) => {
    setCustomers((prev) => [...prev, customer]);
  }, []);

  const formik = useFormik<CreateInvoiceFormValues>({
    initialValues: defaultValues,
    validationSchema,
    onSubmit: async (values) => {
      const termsLabel =
        PAYMENT_TERMS_OPTIONS.find((o) => o.value === values.payment_terms)
          ?.label ?? "Due on Receipt";

      const payload = {
        invoice_number: values.invoice_number,
        reference_number: values.reference_number,
        payment_terms: parseInt(values.payment_terms) || 0,
        payment_terms_label: termsLabel,
        payment_options: { payment_gateways: [] as string[] },
        customer_id: values.customer_id,
        contact_persons: [] as string[],
        date: values.date,
        due_date: values.due_date,
        notes: values.notes,
        terms: values.terms,
        is_inclusive_tax: false,
        line_items: values.line_items.map((li, idx) => ({
          item_order: idx + 1,
          ...(li.item_id ? { item_id: li.item_id } : {}),
          rate: li.rate,
          ...(li.name ? { name: li.name } : {}),
          description: li.description,
          quantity: li.quantity,
          discount: li.discount,
          tax_id: li.tax_id,
          tags: [] as string[],
          ...(li.account_id ? { account_id: li.account_id } : {}),
          item_custom_fields: [] as unknown[],
          ...(li.unit ? { unit: li.unit } : {}),
        })),
        allow_partial_payments: false,
        custom_fields: [] as unknown[],
        is_discount_before_tax: values.is_discount_before_tax,
        discount: values.discount,
        discount_type: values.discount_type,
        adjustment: values.adjustment,
        adjustment_description: values.adjustment_description,
        zcrm_potential_id: "",
        zcrm_potential_name: "",
        pricebook_id: "",
        project_id: "",
        documents: [] as unknown[],
        mail_attachments: [] as unknown[],
        tax_override_preference: "no_override",
        tds_override_preference: "no_override",
      };

      await mutateAsync(payload);
      navigate(RouteConstants.invoices.base.path);
    },
  });

  const customerOptions = useMemo(
    () => customers.map((c) => ({ label: c.name, value: c.id })),
    [customers],
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === formik.values.customer_id),
    [customers, formik.values.customer_id],
  );

  const handleItemSelect = (idx: number, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      formik.setFieldValue(`line_items.${idx}.item_id`, itemId);
      formik.setFieldValue(`line_items.${idx}.name`, item.name);
      formik.setFieldValue(
        `line_items.${idx}.description`,
        item.description ?? "",
      );
      formik.setFieldValue(`line_items.${idx}.rate`, String(item.unitPrice));
      formik.setFieldValue(`line_items.${idx}.unit`, item.unit ?? "");
    }
  };

  const addLineItem = () => {
    formik.setFieldValue("line_items", [
      ...formik.values.line_items,
      { ...EMPTY_LINE_ITEM },
    ]);
  };

  const removeLineItem = (idx: number) => {
    const newLineItems = formik.values.line_items.filter((_, i) => i !== idx);
    formik.setFieldValue("line_items", newLineItems);
  };

  const totals = useMemo(() => {
    const lineItems = formik.values.line_items ?? [];
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
    formik.values.line_items,
    formik.values.discount,
    formik.values.adjustment,
  ]);

  const getLineAmount = (li: LineItemFormRow) => {
    const qty = parseFloat(li.quantity) || 0;
    const rate = parseFloat(li.rate) || 0;
    const discountPct = parseFloat((li.discount ?? "").replace("%", "")) || 0;
    return qty * rate * (1 - discountPct / 100);
  };

  const handleCancel = () => navigate(RouteConstants.invoices.base.path);

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
  };
}
