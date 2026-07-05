import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import {
  useCancelWriteOffInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetInvoiceByIdQuery,
  useRecalculateInvoiceMutation,
  useWriteOffInvoiceMutation,
} from "../../api/query";
import { useGetPaymentsQuery } from "@/features/payments/api";
import { useInvoicePdf } from "../../hooks/useInvoicePdf";

export function useInvoiceDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoiceData, isLoading, isError } = useGetInvoiceByIdQuery(id);
  const { mutateAsync: deleteInvoice, isPending: isDeleting } =
    useDeleteInvoiceMutation();
  const { mutateAsync: writeOffInvoice, isPending: isWritingOff } =
    useWriteOffInvoiceMutation();
  const {
    mutateAsync: cancelWriteOffInvoice,
    isPending: isCancellingWriteOff,
  } = useCancelWriteOffInvoiceMutation();
  const { mutateAsync: recalculateInvoice, isPending: isRecalculating } =
    useRecalculateInvoiceMutation();
  const invoice = invoiceData?.data;

  // Payments linked to this invoice (via their allocations).
  const { data: paymentsData, isLoading: isLoadingPayments } =
    useGetPaymentsQuery(id ? { invoiceId: id } : undefined);
  const payments = paymentsData?.data ?? [];

  const {
    download: downloadPdf,
    share: sharePdf,
    canShareFiles,
    open: openPdf,
    print: printPdf,
    isGenerating: isDownloading,
  } = useInvoicePdf(invoice);

  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingWriteOff, setPendingWriteOff] = useState(false);
  const [pendingCancelWriteOff, setPendingCancelWriteOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const goBack = () => navigate(RouteConstants.invoices.base.path);

  const viewPayment = (paymentId: string) =>
    navigate(RouteConstants.payments.detail.generate({ id: paymentId }));

  const handleEdit = () => {
    if (!invoice) return;
    navigate(RouteConstants.invoices.edit.generate({ id: invoice.id }));
  };

  const handleRecordPayment = () => {
    if (!invoice) return;
    navigate(`${RouteConstants.payments.create.path}?invoiceId=${invoice.id}`);
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    await downloadPdf();
  };

  const handleRecalculate = async () => {
    if (!invoice) return;
    await recalculateInvoice(invoice.id);
  };

  const handleSharePdf = async () => {
    if (!invoice) return;
    setIsSharing(true);
    try {
      await sharePdf();
    } finally {
      setIsSharing(false);
    }
  };

  const requestDelete = () => setPendingDelete(true);
  const cancelDelete = () => setPendingDelete(false);

  const confirmDelete = async (invoiceId: string) => {
    await deleteInvoice(invoiceId);
    setPendingDelete(false);
    navigate(RouteConstants.invoices.base.path);
  };

  const requestWriteOff = () => setPendingWriteOff(true);
  const cancelWriteOff = () => setPendingWriteOff(false);

  const confirmWriteOff = async (reason?: string) => {
    if (!invoice) return;
    await writeOffInvoice({ id: invoice.id, reason });
    setPendingWriteOff(false);
  };

  const requestCancelWriteOff = () => setPendingCancelWriteOff(true);
  const cancelCancelWriteOff = () => setPendingCancelWriteOff(false);

  const confirmCancelWriteOff = async () => {
    if (!invoice) return;
    await cancelWriteOffInvoice(invoice.id);
    setPendingCancelWriteOff(false);
  };

  return {
    invoice,
    isLoading,
    isError,

    payments,
    isLoadingPayments,
    viewPayment,

    goBack,
    handleEdit,
    handleRecordPayment,
    handleDownloadPdf,
    handleSharePdf,
    canShareFiles,
    isSharing,
    openPdf,
    printPdf,
    isDownloading,

    handleRecalculate,
    isRecalculating,

    pendingDelete,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,

    pendingWriteOff,
    requestWriteOff,
    cancelWriteOff,
    confirmWriteOff,
    isWritingOff,

    pendingCancelWriteOff,
    requestCancelWriteOff,
    cancelCancelWriteOff,
    confirmCancelWriteOff,
    isCancellingWriteOff,
  };
}
