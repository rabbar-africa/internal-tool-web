import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import {
  useGetPaymentByIdQuery,
  useDeletePaymentMutation,
} from "../../api/query";
import { useReceiptPdf } from "../../hooks/useReceiptPdf";
import type { IPaymentReceived } from "@/shared/interface/payment";

export function usePaymentDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetPaymentByIdQuery(id);
  const payment = data?.data as IPaymentReceived | undefined;

  const { mutateAsync: deletePayment, isPending: isDeleting } =
    useDeletePaymentMutation();
  const { download: downloadReceipt, isGenerating: isDownloading } =
    useReceiptPdf();
  const [pendingDelete, setPendingDelete] = useState(false);

  const goBack = () => navigate(RouteConstants.payments.base.path);

  const handleEdit = () =>
    navigate(`${RouteConstants.payments.create.path}?paymentId=${id}`);

  const handleDownloadPdf = () => {
    if (payment) void downloadReceipt(payment);
  };

  const requestDelete = () => setPendingDelete(true);
  const cancelDelete = () => setPendingDelete(false);
  const confirmDelete = async () => {
    await deletePayment(id);
    setPendingDelete(false);
    navigate(RouteConstants.payments.base.path);
  };

  return {
    payment,
    isLoading,
    isError,
    goBack,
    handleEdit,
    handleDownloadPdf,
    isDownloading,
    pendingDelete,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
  };
}
