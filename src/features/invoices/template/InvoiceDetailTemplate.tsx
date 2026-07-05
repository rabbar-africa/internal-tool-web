import { Center, Spinner, Stack, Text } from "@chakra-ui/react";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import ConsentDialog from "@/components/common/ConsentDialog";
import { DeleteInvoiceConfirm } from "@/features/invoices/components/invoice-list/DeleteInvoiceConfirm";
import { useInvoiceDetail } from "@/features/invoices/components/invoice-detail/useInvoiceDetail";
import { InvoiceDetailHeader } from "@/features/invoices/components/invoice-detail/InvoiceDetailHeader";
import { InvoicePdfView } from "@/features/invoices/components/invoice-detail/InvoicePdfView";
import { ConnectedPayments } from "@/features/invoices/components/invoice-detail/ConnectedPayments";
import { WriteOffInvoiceConfirm } from "@/features/invoices/components/invoice-detail/WriteOffInvoiceConfirm";

export function InvoiceDetailTemplate() {
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
    pendingCancelWriteOff,
    requestCancelWriteOff,
    cancelCancelWriteOff,
    confirmCancelWriteOff,
    isCancellingWriteOff,
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

  return (
    <>
      <Stack gap="6">
        <InvoiceDetailHeader
          invoice={invoice}
          onEdit={handleEdit}
          onRecordPayment={handleRecordPayment}
          onWriteOff={requestWriteOff}
          onCancelWriteOff={requestCancelWriteOff}
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

      <ConsentDialog
        open={pendingCancelWriteOff}
        onOpenChange={({ open }) => {
          if (!open) cancelCancelWriteOff();
        }}
        variant="warning"
        heading={`Cancel write-off on ${invoice.invoiceNumber}?`}
        note="This reverses the write-off and restores the invoice's outstanding balance."
        confirmText="Yes, Cancel write-off"
        cancelText="Keep write-off"
        isLoading={isCancellingWriteOff}
        handleSubmit={confirmCancelWriteOff}
      />
    </>
  );
}
