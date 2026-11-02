import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { CaretRight } from "@/assets/custom/CaretRight";
import { formatCurrency } from "@/utils/calculations";
import type { JobCardInvoice } from "@/shared/interface/job-card";

interface RecordExpenseModalProps {
  open: boolean;
  onClose: () => void;
  invoices: JobCardInvoice[];
  onSelectInvoice: (invoiceId: string) => void;
  onSelectOther: () => void;
}

/** One tappable choice. */
function Choice({
  title,
  detail,
  aside,
  onClick,
}: {
  title: string;
  detail: string;
  aside?: string;
  onClick: () => void;
}) {
  return (
    <Flex
      as="button"
      w="100%"
      textAlign="left"
      align="center"
      gap="3"
      p="3"
      rounded="lg"
      borderWidth="1px"
      borderColor="gray.75"
      cursor="pointer"
      _hover={{ borderColor: "primary.300", bg: "primary.50" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "primary.300" }}
      onClick={onClick}
    >
      <Box flex="1" minW={0}>
        <Text fontSize="14px" fontWeight="600" color="gray.500">
          {title}
        </Text>
        <Text fontSize="12px" color="gray.400" mt="0.5">
          {detail}
        </Text>
      </Box>
      {aside && (
        <Text fontSize="13px" fontWeight="500" color="gray.500" flexShrink={0}>
          {aside}
        </Text>
      )}
      <CaretRight width="7px" height="12px" color="gray.300" flexShrink={0} />
    </Flex>
  );
}

/**
 * Most money spent on a job goes on what its invoices bill for, so that comes
 * first: tapping an invoice goes straight to entering a cost per item.
 */
export function RecordExpenseModal({
  open,
  onClose,
  invoices,
  onSelectInvoice,
  onSelectOther,
}: RecordExpenseModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="30rem" maxW="full" borderRadius="2xl" pt="2.5rem">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body pb="6">
              <Stack gap="5">
                <Text fontSize="16px" fontWeight="600" color="gray.500">
                  What did you spend on?
                </Text>

                <Stack gap="2">
                  <Text textStyle="tiny-semibold" color="gray.300">
                    {invoices.length === 1
                      ? "The items on this job's invoice"
                      : "The items on one of this job's invoices"}
                  </Text>
                  {invoices.map((invoice) => (
                    <Choice
                      key={invoice.id}
                      title={invoice.invoiceNumber}
                      detail={`${moment(invoice.date).format("DD MMM YYYY")} · enter what you spent on each item`}
                      aside={formatCurrency(invoice.total)}
                      onClick={() => onSelectInvoice(invoice.id)}
                    />
                  ))}
                </Stack>

                <Stack gap="2">
                  <Text textStyle="tiny-semibold" color="gray.300">
                    Something else
                  </Text>
                  <Choice
                    title="Another job expense"
                    detail="A cost on this job that isn't on an invoice"
                    onClick={onSelectOther}
                  />
                </Stack>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
