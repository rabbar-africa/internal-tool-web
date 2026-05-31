import { Center, Spinner, Stack, Text } from "@chakra-ui/react";
import { DeleteInvoiceConfirm } from "../invoice-list/DeleteInvoiceConfirm";
import { useInvoiceDetail } from "./useInvoiceDetail";
import { InvoiceDetailHeader } from "./InvoiceDetailHeader";
import { InvoicePdfView } from "./InvoicePdfView";

export function InvoiceDetailPage() {
  const {
    invoice,
    isLoading,
    isError,

    handleEdit,
    handleRecordPayment,
    handleDownloadPdf,
    isDownloading,

    pendingDelete,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
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
          onDownloadPdf={handleDownloadPdf}
          onDelete={requestDelete}
          isDownloading={isDownloading}
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
    </>
  );
}
