import { Box, Button, Flex, IconButton, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import Status from "@/components/ui/Status";
import type { IInvoiceResponse } from "@/shared/interface/invoice";

interface InvoiceDetailHeaderProps {
  invoice: IInvoiceResponse;
  onBack: () => void;
  onEdit: () => void;
  onRecordPayment: () => void;
  onDownloadPdf: () => void;
  onDelete: () => void;
  isDownloading: boolean;
}

export function InvoiceDetailHeader({
  invoice,
  onBack,
  onEdit,
  onRecordPayment,
  onDownloadPdf,
  onDelete,
  isDownloading,
}: InvoiceDetailHeaderProps) {
  const showRecordPayment = invoice?.status !== "paid";

  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap="3"
    >
      <Flex align="center" gap="3">
        <IconButton
          aria-label="Back to invoices"
          variant="outline"
          size="sm"
          onClick={onBack}
        >
          ←
        </IconButton>
        <Box>
          <Flex align="center" gap="2">
            <Text textStyle="h3-bold" color="gray.500">
              {invoice.invoiceNumber}
            </Text>
            <Status name={invoice?.status || ""} h="1.5rem" w="auto" px="3" />
          </Flex>
          <Text textStyle="small-regular" color="gray.300" mt="0.5">
            Issued {moment(invoice.date).format("DD MMM YYYY")} · Due{" "}
            {moment(invoice.dueDate).format("DD MMM YYYY")}
          </Text>
        </Box>
      </Flex>

      <Stack
        direction={{ base: "column", sm: "row" }}
        gap="2"
        w={{ base: "100%", md: "auto" }}
      >
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadPdf}
          loading={isDownloading}
          loadingText="Downloading..."
        >
          Download PDF
        </Button>
        {showRecordPayment && (
          <Button size="sm" onClick={onRecordPayment}>
            Record Payment
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          borderColor="red.300"
          color="red.500"
          _hover={{ bg: "red.50" }}
          onClick={onDelete}
        >
          Delete
        </Button>
      </Stack>
    </Flex>
  );
}
