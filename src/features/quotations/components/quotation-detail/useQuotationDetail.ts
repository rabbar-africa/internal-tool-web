import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toaster } from "@/components/ui";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import type { ConvertQuotationPayload } from "@/shared/interface/quotation";
import {
  useChangeQuotationStatusMutation,
  useConvertQuotationMutation,
  useDeleteQuotationMutation,
  useGetQuotationByIdQuery,
} from "../../api/query";
import type { QuotationStatusAction } from "../../api/service";
import { quotationActions } from "../../utils/quotation-status";
import { useQuotationPdf } from "../../hooks/useQuotationPdf";

const DONE: Record<QuotationStatusAction, string> = {
  send: "Marked as sent",
  accept: "Marked as accepted",
  decline: "Marked as declined",
  void: "Quote voided",
};

/** What the invoice page is told when it was just made from a quote. */
export interface FromQuoteState {
  fromQuote: { quotationNumber: string; taxChanged: boolean };
}

export function useQuotationDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { has } = usePermissions();

  const query = useGetQuotationByIdQuery(id);
  const quote = query.data?.data;

  const status = useChangeQuotationStatusMutation();
  const convert = useConvertQuotationMutation();
  const remove = useDeleteQuotationMutation();
  const pdf = useQuotationPdf();

  const [declineOpen, setDeclineOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  /** After a draft's PDF goes out: ask whether it was sent. */
  const [askMarkSent, setAskMarkSent] = useState(false);

  const allowed = quote ? quotationActions(quote) : null;
  const canUpdate = has("update:quotations");
  const can = {
    edit: !!allowed?.edit && canUpdate,
    send: !!allowed?.send && canUpdate,
    accept: !!allowed?.accept && canUpdate,
    decline: !!allowed?.decline && canUpdate,
    void: !!allowed?.void && canUpdate,
    convert: !!allowed?.convert && canUpdate && has("create:invoices"),
    delete: !!allowed?.delete && has("delete:quotations"),
  };

  const move = async (action: QuotationStatusAction, reason?: string) => {
    if (!quote) return;
    try {
      await status.mutateAsync({ id: quote.id, action, reason });
      toaster.create({ description: DONE[action], type: "success" });
      if (action === "send") setAskMarkSent(false);
    } catch {
      // A 409 means someone moved it first: show what it is now.
      void query.refetch();
    }
  };

  const afterSending = (wentOut: boolean) => {
    if (wentOut && quote?.status === "DRAFT" && can.send) setAskMarkSent(true);
  };

  return {
    quote,
    isLoading: query.isLoading,
    isError: query.isError,
    can,

    edit: () =>
      quote &&
      navigate(RouteConstants.quotations.edit.generate({ id: quote.id })),
    markSent: () => move("send"),
    accept: () => move("accept"),
    isChangingStatus: status.isPending,

    declineOpen,
    requestDecline: () => setDeclineOpen(true),
    cancelDecline: () => setDeclineOpen(false),
    confirmDecline: async (reason?: string) => {
      await move("decline", reason);
      setDeclineOpen(false);
    },

    voidOpen,
    requestVoid: () => setVoidOpen(true),
    cancelVoid: () => setVoidOpen(false),
    confirmVoid: async () => {
      await move("void");
      setVoidOpen(false);
    },

    deleteOpen,
    requestDelete: () => setDeleteOpen(true),
    cancelDelete: () => setDeleteOpen(false),
    isDeleting: remove.isPending,
    confirmDelete: async () => {
      if (!quote) return;
      await remove.mutateAsync(quote.id);
      setDeleteOpen(false);
      navigate(RouteConstants.quotations.base.path);
    },

    convertOpen,
    requestConvert: () => setConvertOpen(true),
    cancelConvert: () => setConvertOpen(false),
    isConverting: convert.isPending,
    confirmConvert: async (payload: ConvertQuotationPayload) => {
      if (!quote) return;
      try {
        const { data } = await convert.mutateAsync({ id: quote.id, payload });
        setConvertOpen(false);
        const state: FromQuoteState = {
          fromQuote: {
            quotationNumber: quote.quotationNumber,
            taxChanged: data.taxChanged,
          },
        };
        navigate(
          RouteConstants.invoices.detail.generate({ id: data.invoice.id }),
          { state },
        );
      } catch {
        // Nothing changed (limit reached, a deleted tax, converted already):
        // the toast says why, and the page shows the quote as it is now.
        void query.refetch();
      }
    },

    canShare: pdf.canShare,
    isPdfBusy: Boolean(quote && pdf.busyId === quote.id),
    downloadPdf: async () => {
      if (quote) afterSending(await pdf.download(quote));
    },
    sharePdf: async () => {
      if (quote) afterSending(await pdf.share(quote));
    },
    askMarkSent,
    dismissMarkSent: () => setAskMarkSent(false),
  };
}
