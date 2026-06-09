import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetAllCustomersQuery } from "@/features/customers/api";
import {
  useGetAllInvoicesQuery,
  useGetInvoiceByIdQuery,
} from "@/features/invoices/api/query";
import {
  useGetOrganizationBankAccounts,
  useGetOrganizationDetails,
} from "@/features/settings/api";
import { useCreatePaymentMutation } from "../../../api/query";
import {
  PaymentModeDto,
  PaymentReceivedStatusDto,
  type CreatePaymentPayload,
} from "@/shared/interface/payment";
import type { IInvoiceResponse } from "@/shared/interface/invoice";

export interface AllocationRow {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  balance: number;
  amountApplied: string;
}

export interface CreatePaymentFormValues {
  customerId: string;
  customerName: string;
  paymentNumber: string;
  referenceNumber: string;
  date: string;
  mode: PaymentModeDto;
  status: PaymentReceivedStatusDto;
  currencyCode: string;
  exchangeRate: string;
  amount: string;
  bankCharges: string;
  depositToAccountId: string;
  depositToName: string;
  notes: string;
  allocations: AllocationRow[];
}

const today = new Date().toISOString().split("T")[0];

export const PAYMENT_MODE_OPTIONS = [
  { label: "Cash", value: PaymentModeDto.CASH },
  { label: "Bank Transfer", value: PaymentModeDto.BANK_TRANSFER },
  { label: "Card", value: PaymentModeDto.CARD },
  { label: "Mobile Money", value: PaymentModeDto.MOBILE_MONEY },
  { label: "Cheque", value: PaymentModeDto.CHEQUE },
  { label: "Online", value: PaymentModeDto.ONLINE },
  { label: "Other", value: PaymentModeDto.OTHER },
];

export const PAYMENT_STATUS_OPTIONS = [
  { label: "Draft", value: PaymentReceivedStatusDto.DRAFT },
  { label: "Confirmed", value: PaymentReceivedStatusDto.CONFIRMED },
];

const validationSchema = Yup.object({
  customerId: Yup.string().required("Customer is required"),
  date: Yup.string().required("Payment date is required"),
  mode: Yup.string().required("Payment mode is required"),
  amount: Yup.number()
    .typeError("Amount must be a number")
    .moreThan(0, "Amount must be greater than 0")
    .required("Amount is required"),
  bankCharges: Yup.number()
    .typeError("Bank charges must be a number")
    .min(0, "Cannot be negative"),
  exchangeRate: Yup.number()
    .typeError("Exchange rate must be a number")
    .moreThan(0, "Exchange rate must be greater than 0"),
});

const toNum = (v: string | number | null | undefined) => Number(v ?? 0) || 0;

export function useCreatePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetInvoiceId = searchParams.get("invoiceId") ?? "";
  const isPresetMode = Boolean(presetInvoiceId);

  const { mutateAsync, isPending } = useCreatePaymentMutation();
  const { data: orgData } = useGetOrganizationDetails();
  const orgCurrency = orgData?.data?.currency || "NGN";

  // Preset flow: recording against a specific invoice (from its detail page).
  const presetInvoiceQuery = useGetInvoiceByIdQuery(presetInvoiceId);
  const presetInvoice = presetInvoiceQuery.data?.data as
    | IInvoiceResponse
    | undefined;

  // ─── Customers (searchable) ─────────────────────────────────────────────
  const [customerSearch, setCustomerSearch] = useState("");
  const debouncedSearch = useDebounce(customerSearch, 400);
  const customersQuery = useGetAllCustomersQuery({
    page: 1,
    limit: 30,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });
  const customers = useMemo(
    () => customersQuery.data?.data ?? [],
    [customersQuery.data?.data],
  );
  // Cache so the chosen customer name survives a changing search list.
  const [customerCache, setCustomerCache] = useState<
    Record<string, { id: string; name: string }>
  >({});
  useEffect(() => {
    if (!customers.length) return;
    setCustomerCache((prev) => {
      const next = { ...prev };
      customers.forEach((c) => {
        next[c.id] = { id: c.id, name: c.displayName };
      });
      return next;
    });
  }, [customers]);

  const customerOptions = useMemo(
    () => customers.map((c) => ({ label: c.displayName, value: c.id })),
    [customers],
  );

  // ─── Bank accounts (deposit to) ─────────────────────────────────────────
  const { data: bankAccountsData } = useGetOrganizationBankAccounts();
  const bankAccountOptions = useMemo(
    () =>
      (bankAccountsData?.data ?? []).map((acc) => ({
        label: acc.bankName
          ? `${acc.accountName} — ${acc.bankName}`
          : acc.accountName,
        value: acc.id,
      })),
    [bankAccountsData?.data],
  );

  const formik = useFormik<CreatePaymentFormValues>({
    enableReinitialize: false,
    validationSchema,
    initialValues: {
      customerId: "",
      customerName: "",
      paymentNumber: "",
      referenceNumber: "",
      date: today,
      mode: PaymentModeDto.BANK_TRANSFER,
      status: PaymentReceivedStatusDto.CONFIRMED,
      currencyCode: orgCurrency,
      exchangeRate: "1",
      amount: "",
      bankCharges: "0",
      depositToAccountId: "",
      depositToName: "",
      notes: "",
      allocations: [],
    },
    onSubmit: async (values) => {
      const amountApplied = values.allocations.reduce(
        (sum, a) => sum + toNum(a.amountApplied),
        0,
      );
      const amount = toNum(values.amount);

      const payload: CreatePaymentPayload = {
        paymentNumber: values.paymentNumber,
        referenceNumber: values.referenceNumber,
        customerId: values.customerId,
        customerName: values.customerName,
        customer: { id: values.customerId, name: values.customerName },
        date: values.date,
        mode: values.mode,
        status: values.status,
        currencyCode: values.currencyCode,
        exchangeRate: toNum(values.exchangeRate) || 1,
        amount,
        bankCharges: toNum(values.bankCharges),
        depositToAccountId: values.depositToAccountId,
        depositToName: values.depositToName,
        notes: values.notes,
        allocations: values.allocations
          .filter((a) => toNum(a.amountApplied) > 0)
          .map((a) => ({
            invoiceId: a.invoiceId,
            amountApplied: toNum(a.amountApplied),
          })),
        amountApplied,
        unusedAmount: Math.max(0, amount - amountApplied),
      };

      await mutateAsync(payload);
      navigate(RouteConstants.payments.base.path);
    },
  });

  const { values, setFieldValue } = formik;

  // ─── Outstanding invoices for the selected customer (manual flow) ───────
  const invoicesQuery = useGetAllInvoicesQuery(
    { customerId: values.customerId, page: 1, limit: 100 },
    { enabled: Boolean(values.customerId) && !isPresetMode },
  );
  const outstandingInvoices = useMemo(
    () =>
      // The list endpoint returns the rich invoice shape, but the service is
      // typed with the legacy `Invoice`; cast to the real response type.
      (
        (invoicesQuery.data?.data ?? []) as unknown as IInvoiceResponse[]
      ).filter((inv) => toNum(inv.balance) > 0),
    [invoicesQuery.data?.data],
  );

  // Manual flow: rebuild allocation rows when the customer's invoices load.
  useEffect(() => {
    if (isPresetMode) return;
    const rows: AllocationRow[] = outstandingInvoices.map((inv) => ({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.date,
      dueDate: inv.dueDate,
      balance: toNum(inv.balance),
      amountApplied: "",
    }));
    setFieldValue("allocations", rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outstandingInvoices, isPresetMode]);

  // Preset flow: lock the form to the invoice from the URL.
  const presetBalance = toNum(presetInvoice?.balance);
  const presetApplied = useRef(false);
  useEffect(() => {
    if (!isPresetMode || !presetInvoice || presetApplied.current) return;
    presetApplied.current = true;
    const name =
      presetInvoice.client?.displayName || presetInvoice.customerName || "";
    setFieldValue("customerId", presetInvoice.customerId);
    setFieldValue("customerName", name);
    if (presetInvoice.currencyCode)
      setFieldValue("currencyCode", presetInvoice.currencyCode);
    setFieldValue("amount", presetBalance ? String(presetBalance) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresetMode, presetInvoice]);

  // Keep the single preset allocation in sync with the entered amount.
  useEffect(() => {
    if (!isPresetMode || !presetInvoice) return;
    const applied = Math.min(toNum(values.amount), presetBalance);
    setFieldValue("allocations", [
      {
        invoiceId: presetInvoice.id,
        invoiceNumber: presetInvoice.invoiceNumber,
        invoiceDate: presetInvoice.date,
        dueDate: presetInvoice.dueDate,
        balance: presetBalance,
        amountApplied: applied ? String(applied) : "",
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresetMode, presetInvoice, values.amount, presetBalance]);

  const handleSelectCustomer = (id: string) => {
    setFieldValue("customerId", id);
    setFieldValue("customerName", customerCache[id]?.name ?? "");
  };

  const handleSelectDepositAccount = (id: string) => {
    const acc = (bankAccountsData?.data ?? []).find((a) => a.id === id);
    setFieldValue("depositToAccountId", id);
    setFieldValue("depositToName", acc?.accountName ?? "");
  };

  const setAllocationAmount = (index: number, value: string) => {
    const next = values.allocations.map((row, i) =>
      i === index ? { ...row, amountApplied: value } : row,
    );
    setFieldValue("allocations", next);
  };

  /** Distribute the entered amount across outstanding invoices, oldest first. */
  const autoAllocate = () => {
    let remaining = toNum(values.amount);
    const next = values.allocations.map((row) => {
      const apply = Math.min(remaining, row.balance);
      remaining = Math.max(0, remaining - apply);
      return { ...row, amountApplied: apply > 0 ? String(apply) : "" };
    });
    setFieldValue("allocations", next);
  };

  const clearAllocations = () => {
    setFieldValue(
      "allocations",
      values.allocations.map((row) => ({ ...row, amountApplied: "" })),
    );
  };

  const totals = useMemo(() => {
    const amount = toNum(values.amount);
    const amountApplied = values.allocations.reduce(
      (sum, a) => sum + toNum(a.amountApplied),
      0,
    );
    return {
      amount,
      amountApplied,
      unusedAmount: amount - amountApplied,
      overApplied: amountApplied > amount,
    };
  }, [values.amount, values.allocations]);

  // Read-only summary for the preset (invoice-driven) flow.
  const presetSummary = useMemo(() => {
    const amount = toNum(values.amount);
    return {
      invoiceNumber: presetInvoice?.invoiceNumber ?? "",
      invoiceDate: presetInvoice?.date ?? "",
      dueDate: presetInvoice?.dueDate ?? "",
      customerName:
        presetInvoice?.client?.displayName || presetInvoice?.customerName || "",
      currencyCode: presetInvoice?.currencyCode || orgCurrency,
      total: toNum(presetInvoice?.total),
      balance: presetBalance,
      amount,
      balanceAfter: presetBalance - Math.min(amount, presetBalance),
      overpaid: amount > presetBalance,
    };
  }, [presetInvoice, presetBalance, values.amount, orgCurrency]);

  const handleCancel = () => navigate(RouteConstants.payments.base.path);

  return {
    formik,
    isPending,
    orgCurrency,
    // preset (invoice-driven) flow
    isPresetMode,
    isLoadingPresetInvoice: presetInvoiceQuery.isLoading && isPresetMode,
    presetInvoiceNotFound:
      isPresetMode && !presetInvoiceQuery.isLoading && !presetInvoice,
    presetSummary,
    // customer
    customerOptions,
    customerSearch,
    setCustomerSearch,
    isSearchingCustomers: customersQuery.isFetching,
    handleSelectCustomer,
    // deposit
    bankAccountOptions,
    handleSelectDepositAccount,
    // allocations
    isLoadingInvoices: invoicesQuery.isFetching,
    setAllocationAmount,
    autoAllocate,
    clearAllocations,
    totals,
    handleCancel,
  };
}
