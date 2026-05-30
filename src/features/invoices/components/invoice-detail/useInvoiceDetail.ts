import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { downloadInvoicePdf } from "../../api/service";
import {
  useDeleteInvoiceMutation,
  useGetInvoiceByIdQuery,
} from "../../api/query";

export function useInvoiceDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoiceData, isLoading, isError } = useGetInvoiceByIdQuery(id);
  const { mutateAsync: deleteInvoice, isPending: isDeleting } =
    useDeleteInvoiceMutation();
  const invoice = invoiceData?.data;

  const [pendingDelete, setPendingDelete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const goBack = () => navigate(RouteConstants.invoices.base.path);

  const handleEdit = () => {
    if (!invoice) return;
    navigate(RouteConstants.invoices.detail.generate({ id: invoice.id }));
  };

  const handleRecordPayment = () => {
    if (!invoice) return;
    navigate(`${RouteConstants.payments.create.path}?invoiceId=${invoice.id}`);
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      setIsDownloading(true);
      await downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    } finally {
      setIsDownloading(false);
    }
  };

  const requestDelete = () => setPendingDelete(true);
  const cancelDelete = () => setPendingDelete(false);

  const confirmDelete = async (invoiceId: string) => {
    await deleteInvoice(invoiceId);
    setPendingDelete(false);
    navigate(RouteConstants.invoices.base.path);
  };

  return {
    invoice,
    isLoading,
    isError,

    goBack,
    handleEdit,
    handleRecordPayment,
    handleDownloadPdf,
    isDownloading,

    pendingDelete,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
  };
}
