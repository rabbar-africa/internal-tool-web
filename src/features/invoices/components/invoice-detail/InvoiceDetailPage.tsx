import { Center, Spinner, Stack, Text } from "@chakra-ui/react";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { DeleteInvoiceConfirm } from "../invoice-list/DeleteInvoiceConfirm";
import { useInvoiceDetail } from "./useInvoiceDetail";
import { InvoiceDetailHeader } from "./InvoiceDetailHeader";
import { InvoicePdfView } from "./InvoicePdfView";
import { ConnectedPayments } from "./ConnectedPayments";
import { WriteOffInvoiceConfirm } from "./WriteOffInvoiceConfirm";

export function InvoiceDetailPage() {
  const { formatMoney } = useFormatMoney();
  const {
    invoice,
    isLoading,
    isError,
    payments,
    viewPayment,
    handleEdit,
    handleRecordPayment,
    handleDownloadPdf,
    handleSharePdf,
    canShareFiles,
    isSharing,
    isDownloading,
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
  } = useInvoiceDetail();

  if (isLoading) {
    return (
      <Center py="20">
        <Spinner color="primary.400" />
      </Center>
    );
  }

  if (isError || !invoice) {
    return (
      <Center py="20">
        <Text color="red.500">Invoice not found.</Text>
      </Center>
    );
  }
  // console.log("invoice is ", invoice);

  return (
    <>
      <Stack gap="6">
        <InvoiceDetailHeader
          invoice={invoice}
          onEdit={handleEdit}
          onRecordPayment={handleRecordPayment}
          onWriteOff={requestWriteOff}
          onDownloadPdf={handleDownloadPdf}
          onSharePdf={handleSharePdf}
          canShare={canShareFiles}
          isSharing={isSharing}
          onDelete={requestDelete}
          isDownloading={isDownloading}
        />

        <ConnectedPayments
          payments={payments}
          invoiceId={invoice.id}
          onViewPayment={viewPayment}
        />

        <InvoicePdfView invoice={invoice} />
      </Stack>

      <DeleteInvoiceConfirm
        target={
          pendingDelete && invoice
            ? { id: invoice.id, invoiceNumber: invoice.invoiceNumber }
            : null
        }
        isDeleting={isDeleting}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      <WriteOffInvoiceConfirm
        open={pendingWriteOff}
        invoiceNumber={invoice.invoiceNumber}
        balanceLabel={formatMoney(Number(invoice.balance ?? 0) || 0)}
        isWritingOff={isWritingOff}
        onCancel={cancelWriteOff}
        onConfirm={confirmWriteOff}
      />
    </>
  );
}
