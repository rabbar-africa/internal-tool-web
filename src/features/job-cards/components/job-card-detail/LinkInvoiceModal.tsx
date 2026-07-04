import { useMemo, useState } from "react";
import { Button, Dialog, Flex, Portal, Stack } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { useGetAllInvoicesQuery } from "@/features/invoices/api/query";
import { useLinkJobCardInvoiceMutation } from "../../api/query";

interface LinkInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  jobCardId: string;
  /** Invoices already on the job card — excluded from the picker. */
  linkedInvoiceIds: string[];
}

export function LinkInvoiceModal({
  open,
  onClose,
  jobCardId,
  linkedInvoiceIds,
}: LinkInvoiceModalProps) {
  const [invoiceId, setInvoiceId] = useState("");
  const { data, isLoading } = useGetAllInvoicesQuery(
    { limit: 100 },
    { enabled: open },
  );
  const { mutateAsync: linkInvoice, isPending } =
    useLinkJobCardInvoiceMutation();

  const options = useMemo(() => {
    const linked = new Set(linkedInvoiceIds);
    return (data?.data ?? [])
      .filter((invoice) => !linked.has(invoice.id))
      .map((invoice) => ({
        label: `${invoice.invoiceNumber} — ${invoice.customer?.name ?? ""}`,
        value: invoice.id,
      }));
  }, [data?.data, linkedInvoiceIds]);

  const handleClose = () => {
    setInvoiceId("");
    onClose();
  };

  const handleLink = async () => {
    if (!invoiceId) return;
    await linkInvoice({ jobCardId, invoiceId });
    handleClose();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) handleClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="440px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Link Existing Invoice
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body py="5">
              <Stack gap="4">
                <CustomSelect
                  label="Invoice"
                  placeholder="Select invoice..."
                  options={options}
                  loading={isLoading}
                  noOptionsText="No unlinked invoices found"
                  value={invoiceId ? [invoiceId] : undefined}
                  onChange={(opt: { value: string[] }) =>
                    setInvoiceId(opt?.value?.[0] ?? "")
                  }
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
              <Flex gap="3" justify="flex-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLink}
                  disabled={!invoiceId}
                  loading={isPending}
                  loadingText="Linking..."
                >
                  Link Invoice
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
