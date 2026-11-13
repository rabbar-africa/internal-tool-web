import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  ApplyCreditPayload,
  CreditApplication,
  CreditRefund,
  RefundCreditNotePayload,
} from "@/shared/interface/credit-note";
import {
  useApplyCreditNoteMutation,
  useDeleteCreditNoteMutation,
  useDeleteCreditRefundMutation,
  useGetCreditNoteByIdQuery,
  useIssueCreditNoteMutation,
  useRefundCreditNoteMutation,
  useRemoveCreditApplicationMutation,
  useVoidCreditNoteMutation,
} from "../../api/query";
import { useCreditNotePdf } from "../../hooks/useCreditNotePdf";
import {
  creditNoteActions,
  isCreditUsed,
} from "../../utils/credit-note-status";

type Dialog = "issue" | "apply" | "refund" | "void" | "delete" | null;

export function useCreditNoteDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useGetCreditNoteByIdQuery(id);
  const note = data?.data;

  const { has, canAccess } = usePermissions();
  const canUpdate = has("update:credit_notes");
  const allowed = note
    ? creditNoteActions(note)
    : creditNoteActions({
        status: "VOID",
        balance: "0",
        amountApplied: "0",
        amountRefunded: "0",
      });
  const isLive = note?.status === "OPEN" || note?.status === "CLOSED";

  // What the status allows, and the role too; forbidden actions are hidden.
  const can = {
    edit: canUpdate && allowed.edit,
    issue: canUpdate && allowed.issue,
    apply: canUpdate && allowed.apply,
    refund: canAccess("creditNoteRefund") && allowed.refund,
    // Shown for an open note even once used: choosing it says why it can't.
    void: canUpdate && (note?.status === "DRAFT" || note?.status === "OPEN"),
    delete: has("delete:credit_notes") && allowed.delete,
    removeApplication: canUpdate && isLive,
    deleteRefund: canAccess("creditNoteRefundDelete") && isLive,
  };
  const voidBlocked = Boolean(note && isCreditUsed(note));

  const [dialog, setDialog] = useState<Dialog>(null);
  const [pendingApplication, setPendingApplication] =
    useState<CreditApplication | null>(null);
  const [pendingRefund, setPendingRefund] = useState<CreditRefund | null>(null);

  const issue = useIssueCreditNoteMutation();
  const apply = useApplyCreditNoteMutation();
  const refund = useRefundCreditNoteMutation();
  const voidNote = useVoidCreditNoteMutation();
  const remove = useDeleteCreditNoteMutation();
  const unapply = useRemoveCreditApplicationMutation();
  const deleteRefund = useDeleteCreditRefundMutation();
  const pdf = useCreditNotePdf();

  const close = () => setDialog(null);

  return {
    note,
    isLoading,
    isError,
    can,
    voidBlocked,
    dialog,
    open: setDialog,
    close,

    edit: () =>
      note &&
      navigate(RouteConstants.creditNotes.edit.generate({ id: note.id })),
    downloadPdf: () => note && pdf.download(note),
    sharePdf: () => note && pdf.share(note),
    canShare: pdf.canShare,
    isPdfBusy: Boolean(note && pdf.busyId === note.id),

    confirmIssue: async (applyToInvoice: boolean) => {
      if (!note) return;
      await issue.mutateAsync({ id: note.id, applyToInvoice });
      close();
    },
    isIssuing: issue.isPending,

    confirmApply: async (payload: ApplyCreditPayload) => {
      if (!note) return;
      await apply.mutateAsync({ id: note.id, payload });
      close();
    },
    isApplying: apply.isPending,

    confirmRefund: async (payload: RefundCreditNotePayload) => {
      if (!note) return;
      await refund.mutateAsync({ id: note.id, payload });
      close();
    },
    isRefunding: refund.isPending,

    confirmVoid: async () => {
      if (!note) return;
      await voidNote.mutateAsync(note.id);
      close();
    },
    isVoiding: voidNote.isPending,

    confirmDelete: async () => {
      if (!note) return;
      await remove.mutateAsync(note.id);
      close();
      navigate(RouteConstants.creditNotes.base.path);
    },
    isDeleting: remove.isPending,

    pendingApplication,
    requestRemoveApplication: setPendingApplication,
    cancelRemoveApplication: () => setPendingApplication(null),
    confirmRemoveApplication: async () => {
      if (!note || !pendingApplication) return;
      await unapply.mutateAsync({
        id: note.id,
        applicationId: pendingApplication.id,
      });
      setPendingApplication(null);
    },
    isRemovingApplication: unapply.isPending,

    pendingRefund,
    requestDeleteRefund: setPendingRefund,
    cancelDeleteRefund: () => setPendingRefund(null),
    confirmDeleteRefund: async () => {
      if (!note || !pendingRefund) return;
      await deleteRefund.mutateAsync({
        id: note.id,
        refundId: pendingRefund.id,
      });
      setPendingRefund(null);
    },
    isDeletingRefund: deleteRefund.isPending,
  };
}

export type CreditNoteDetail = ReturnType<typeof useCreditNoteDetail>;
