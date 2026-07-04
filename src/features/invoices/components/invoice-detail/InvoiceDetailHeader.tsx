import { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Menu,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { CustomBreadCrumb } from "@/components/elements/custom-breadcrumb";
import Status from "@/components/ui/Status";
import { ThreeDotsIcon } from "@/assets/custom/ThreeDotsIcon";
import { RouteConstants } from "@/shared/constants/routes";
import type { IInvoiceResponse } from "@/shared/interface/invoice";

interface InvoiceDetailHeaderProps {
  invoice: IInvoiceResponse;
  onEdit: () => void;
  onRecordPayment: () => void;
  onWriteOff: () => void;
  onDownloadPdf: () => Promise<void> | void;
  onSharePdf: () => Promise<void> | void;
  /** Whether this device supports the native file share sheet (phones). */
  canShare: boolean;
  isSharing: boolean;
  onDelete: () => void;
  isDownloading: boolean;
}

export function InvoiceDetailHeader({
  invoice,
  onEdit,
  onRecordPayment,
  onWriteOff,
  onDownloadPdf,
  onSharePdf,
  canShare,
  isSharing,
  onDelete,
  isDownloading,
}: InvoiceDetailHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = invoice.status?.toLowerCase();
  const hasBalance = Number(invoice.balance ?? 0) > 0;
  const showRecordPayment = status !== "paid";
  // Write-off only makes sense while money is still outstanding and the
  // invoice isn't already closed/void/written off.
  const showWriteOff =
    hasBalance && !["paid", "void", "written_off"].includes(status ?? "");

  // Sync action: closes the menu immediately, then runs the handler.
  const handleSync = (handler: () => void) => () => {
    setMenuOpen(false);
    handler();
  };

  // Async action: keeps the menu open until the handler resolves.
  const handleAsync = (handler: () => Promise<void> | void) => async () => {
    try {
      await handler();
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap="3"
    >
      <Stack gap="1">
        <CustomBreadCrumb
          items={[
            { label: "Invoices", to: RouteConstants.invoices.base.path },
            { label: invoice.invoiceNumber, isCurrent: true },
          ]}
        />
        <Text textStyle="small-regular" color="gray.300">
          Issued {moment(invoice.date).format("DD MMM YYYY")} · Due{" "}
          {moment(invoice.dueDate).format("DD MMM YYYY")}
        </Text>
      </Stack>

      <Flex align="center" gap="3">
        <Status name={invoice.status || ""} h="1.75rem" w="auto" px="3" />

        <Menu.Root
          open={menuOpen}
          onOpenChange={({ open }) => setMenuOpen(open)}
        >
          <Menu.Trigger asChild>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Invoice actions"
            >
              <ThreeDotsIcon color="gray.500" />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="180px">
                <Menu.Item value="edit" onClick={handleSync(onEdit)}>
                  Edit
                </Menu.Item>

                {showRecordPayment && (
                  <Menu.Item
                    value="record-payment"
                    onClick={handleSync(onRecordPayment)}
                  >
                    Record Payment
                  </Menu.Item>
                )}

                {showWriteOff && (
                  <Menu.Item value="write-off" onClick={handleSync(onWriteOff)}>
                    Write off invoice
                  </Menu.Item>
                )}

                {canShare && (
                  <Menu.Item
                    value="share-pdf"
                    closeOnSelect={false}
                    disabled={isSharing || isDownloading}
                    onSelect={() => {
                      // Builds the PDF, then opens the phone's native share
                      // sheet (WhatsApp, Mail, …) via the Web Share API.
                      void handleAsync(onSharePdf)();
                    }}
                  >
                    {isSharing ? "Preparing…" : "Send PDF"}
                  </Menu.Item>
                )}

                <Menu.Item
                  value="download-pdf"
                  closeOnSelect={false}
                  disabled={isDownloading || isSharing}
                  onSelect={() => {
                    // closeOnSelect={false} keeps the menu open;
                    // handleAsync closes it after the work resolves.
                    void handleAsync(onDownloadPdf)();
                  }}
                >
                  {isDownloading ? "Downloading…" : "Download PDF"}
                </Menu.Item>

                <Box>
                  <Menu.Separator borderColor="gray.50" />
                  <Menu.Item
                    value="delete"
                    color="red.500"
                    _hover={{ bg: "red.50" }}
                    onClick={handleSync(onDelete)}
                  >
                    Delete
                  </Menu.Item>
                </Box>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  );
}
