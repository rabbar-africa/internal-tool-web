import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import ConsentDialog from "@/components/common/ConsentDialog";
import { QuotationDetailHeader } from "../components/quotation-detail/QuotationDetailHeader";
import { QuotationDocument } from "../components/quotation-detail/QuotationDocument";
import { ConvertQuotationDialog } from "../components/quotation-detail/ConvertQuotationDialog";
import { useQuotationDetail } from "../components/quotation-detail/useQuotationDetail";

export function QuotationDetailTemplate() {
  const detail = useQuotationDetail();
  const { quote } = detail;
  const [declineReason, setDeclineReason] = useState("");

  if (detail.isLoading) {
    return (
      <Center py="20">
        <Spinner color="primary.400" />
      </Center>
    );
  }

  if (detail.isError || !quote) {
    return (
      <Center py="20">
        <Text color="red.500">Quote not found.</Text>
      </Center>
    );
  }

  const isExpired = quote.displayStatus === "EXPIRED";

  return (
    <>
      <Stack gap="6">
        <QuotationDetailHeader quote={quote} detail={detail} />

        {/* The PDF went out from a draft: the app can't know it was sent. */}
        {detail.askMarkSent && (
          <Flex
            align={{ base: "flex-start", sm: "center" }}
            justify="space-between"
            direction={{ base: "column", sm: "row" }}
            gap="3"
            bg="blue.50"
            borderWidth="1px"
            borderColor="blue.100"
            rounded="lg"
            px="4"
            py="3"
          >
            <Text fontSize="13px" color="blue.800">
              Did you send it to the customer? Mark it as sent so you can follow
              it up.
            </Text>
            <Flex gap="2">
              <Button
                size="xs"
                variant="ghost"
                onClick={detail.dismissMarkSent}
              >
                Not yet
              </Button>
              <Button
                size="xs"
                loading={detail.isChangingStatus}
                onClick={detail.markSent}
              >
                Mark as sent
              </Button>
            </Flex>
          </Flex>
        )}

        {isExpired && (
          <Box
            bg="warning.50"
            borderWidth="1px"
            borderColor="warning.100"
            rounded="lg"
            px="4"
            py="3"
          >
            <Text fontSize="13px" color="gray.500">
              This quote has passed its Valid until date. You can still mark it
              accepted and make the invoice if you're honouring the price.
            </Text>
          </Box>
        )}

        <QuotationDocument quote={quote} />
      </Stack>

      <ConsentDialog
        open={detail.declineOpen}
        onOpenChange={({ open }) => {
          if (!open) {
            setDeclineReason("");
            detail.cancelDecline();
          }
        }}
        variant="warning"
        heading={`Mark ${quote.quotationNumber} as declined?`}
        note="You can mark it accepted later if the customer changes their mind."
        confirmText="Mark declined"
        cancelText="Cancel"
        isLoading={detail.isChangingStatus}
        handleSubmit={async () => {
          await detail.confirmDecline(declineReason.trim() || undefined);
          setDeclineReason("");
        }}
      >
        <Box mt="3" textAlign="left">
          <Text fontSize="13px" fontWeight="500" color="gray.500" mb="1">
            What did they say? (optional)
          </Text>
          <Textarea
            rows={3}
            fontSize="16px"
            placeholder="e.g. Found a cheaper price elsewhere"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </Box>
      </ConsentDialog>

      <ConsentDialog
        open={detail.voidOpen}
        onOpenChange={({ open }) => {
          if (!open) detail.cancelVoid();
        }}
        variant="danger"
        heading={`Void ${quote.quotationNumber}?`}
        note="A voided quote can't be edited, accepted or made into an invoice. This can't be undone."
        confirmText="Void quote"
        cancelText="Keep it"
        isLoading={detail.isChangingStatus}
        handleSubmit={detail.confirmVoid}
      />

      <ConsentDialog
        open={detail.deleteOpen}
        onOpenChange={({ open }) => {
          if (!open) detail.cancelDelete();
        }}
        variant="danger"
        heading={`Delete ${quote.quotationNumber}?`}
        note="The quote is removed from your lists. It still counts towards your plan's quote limit."
        confirmText="Delete"
        cancelText="Keep it"
        isLoading={detail.isDeleting}
        handleSubmit={detail.confirmDelete}
      />

      <ConvertQuotationDialog
        open={detail.convertOpen}
        quotationNumber={quote.quotationNumber}
        isConverting={detail.isConverting}
        onCancel={detail.cancelConvert}
        onConfirm={detail.confirmConvert}
      />
    </>
  );
}
