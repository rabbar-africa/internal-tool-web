import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetAllInvoicesQuery,
  useGetOutstandingInvoicesQuery,
  useAddCarriedInvoiceMutation,
  useRemoveCarriedInvoiceMutation,
} from "../../../api/query";
import { addCarriedInvoice } from "../../../api/service";
import type {
  CarriedInvoice,
  IInvoiceResponse,
} from "@/shared/interface/invoice";
import { getErrorMessage } from "@/utils/handle-error";

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;

export interface CarryFlushFailure {
  invoice: CarriedInvoice;
  message: string;
}

export interface UseInvoiceCarryForwardOptions {
  isEdit: boolean;
  /** Empty until the invoice exists (i.e. throughout the create flow). */
  invoiceId: string;
  customerId: string;
  /** The invoice's server-side carries — edit mode only. */
  serverCarried: CarriedInvoice[];
}

/**
 * Drives the "bring past unpaid balance" action.
 *
 * Edit mode has a real invoice id, so links are written through immediately and
 * candidates come from the server's eligibility endpoint. Create mode has no id
 * until the invoice is saved, so picks are staged locally and flushed by
 * `flush()` once the id exists — see `flushFailures` for the half-succeeded case.
 */
export function useInvoiceCarryForward({
  isEdit,
  invoiceId,
  customerId,
  serverCarried,
}: UseInvoiceCarryForwardOptions) {
  const [staged, setStaged] = useState<CarriedInvoice[]>([]);
  const [flushFailures, setFlushFailures] = useState<CarryFlushFailure[]>([]);
  const [isFlushing, setIsFlushing] = useState(false);

  const { mutateAsync: addLink, isPending: isAdding } =
    useAddCarriedInvoiceMutation();
  const { mutateAsync: removeLink, isPending: isRemoving } =
    useRemoveCarriedInvoiceMutation();

  // Edit mode: the server knows exactly what's eligible (same customer, still
  // unpaid, not already riding on another document).
  const outstandingQuery = useGetOutstandingInvoicesQuery(
    isEdit ? invoiceId : "",
  );

  // Create mode: no invoice id yet, so fall back to the customer's unpaid
  // invoices. This can't know what's already carried elsewhere, which is why a
  // staged pick may still be rejected at flush time.
  const customerInvoicesQuery = useGetAllInvoicesQuery(
    { customerId, page: 1, limit: 100 },
    { enabled: !isEdit && Boolean(customerId) },
  );

  const carried = isEdit ? serverCarried : staged;

  const candidates = useMemo(() => {
    if (isEdit) return outstandingQuery.data?.data ?? [];

    // The list endpoint returns the rich invoice shape but is typed with the
    // legacy `Invoice`; cast to the real response type (as useCreatePayment does).
    const invoices = (customerInvoicesQuery.data?.data ??
      []) as unknown as IInvoiceResponse[];

    return invoices
      .filter((inv) => toNum(inv.balance) > 0)
      .map<CarriedInvoice>((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        dueDate: inv.dueDate,
        total: inv.total,
        balance: inv.balance,
        status: inv.status,
      }));
  }, [isEdit, outstandingQuery.data?.data, customerInvoicesQuery.data?.data]);

  // Never offer something that's already brought forward.
  const availableCandidates = useMemo(() => {
    const taken = new Set(carried.map((c) => c.id));
    return candidates.filter((c) => !taken.has(c.id));
  }, [candidates, carried]);

  // A staged pick is only valid for the customer it was chosen under — the API
  // rejects carrying another customer's invoice — so drop them on a switch.
  useEffect(() => {
    if (isEdit) return;
    setStaged([]);
    setFlushFailures([]);
  }, [customerId, isEdit]);

  const add = useCallback(
    async (invoice: CarriedInvoice) => {
      if (isEdit) {
        await addLink({ id: invoiceId, carriedInvoiceId: invoice.id });
        return;
      }
      setStaged((prev) =>
        prev.some((c) => c.id === invoice.id) ? prev : [...prev, invoice],
      );
    },
    [isEdit, invoiceId, addLink],
  );

  const remove = useCallback(
    async (carriedInvoiceId: string) => {
      if (isEdit) {
        await removeLink({ id: invoiceId, carriedInvoiceId });
        return;
      }
      setStaged((prev) => prev.filter((c) => c.id !== carriedInvoiceId));
      setFlushFailures((prev) =>
        prev.filter((f) => f.invoice.id !== carriedInvoiceId),
      );
    },
    [isEdit, invoiceId, removeLink],
  );

  /**
   * Links every staged invoice onto `newInvoiceId`, one at a time so a rejection
   * can be attributed to the invoice that caused it. Returns the ones that
   * failed; the caller decides whether to retry or move on. Calls the service
   * directly rather than the mutation so a batch raises one error, not N toasts.
   */
  const flush = useCallback(
    async (newInvoiceId: string, subset?: CarriedInvoice[]) => {
      const targets = subset ?? staged;
      if (!targets.length) return [];

      setIsFlushing(true);
      const failures: CarryFlushFailure[] = [];
      try {
        for (const invoice of targets) {
          try {
            await addCarriedInvoice(newInvoiceId, invoice.id);
          } catch (error) {
            failures.push({ invoice, message: getErrorMessage(error) });
          }
        }
      } finally {
        setIsFlushing(false);
      }
      setFlushFailures(failures);
      return failures;
    },
    [staged],
  );

  const clearFlushFailures = useCallback(() => setFlushFailures([]), []);
  // console.log("carried is ", carried);

  return {
    carried,
    availableCandidates,
    isLoadingCandidates: isEdit
      ? outstandingQuery.isFetching
      : customerInvoicesQuery.isFetching,
    add,
    remove,
    isMutating: isAdding || isRemoving,
    // create-flow only
    flush,
    isFlushing,
    flushFailures,
    clearFlushFailures,
    broughtForwardTotal: carried.reduce((sum, c) => sum + toNum(c.balance), 0),
  };
}
