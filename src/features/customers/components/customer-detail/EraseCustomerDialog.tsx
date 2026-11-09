import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Dialog,
  Flex,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { toaster } from "@/components/ui";
import { sameName } from "@/utils/string-formatter";
import type { CustomerEraseImpact } from "@/shared/interface/customer";
import {
  useEraseCustomerMutation,
  useGetCustomerEraseImpactQuery,
} from "../../api/query";

/** "2 vehicles", or nothing when there are none. */
const count = (n: number, one: string, many: string) =>
  n > 0 ? `${n.toLocaleString()} ${n === 1 ? one : many}` : null;

/** "a, b and c". */
const listOf = (parts: Array<string | null>) => {
  const items = parts.filter(Boolean) as string[];
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

function ImpactList({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "error" | "warning" | "gray";
  children: React.ReactNode;
}) {
  const colors = {
    error: { bg: "error.50", title: "error.300" },
    warning: { bg: "warning.50", title: "warning.300" },
    gray: { bg: "gray.25", title: "gray.500" },
  }[tone];
  return (
    <Box bg={colors.bg} rounded="lg" px="4" py="3">
      <Text textStyle="small-semibold" color={colors.title}>
        {title}
      </Text>
      <Text textStyle="small-regular" color="gray.500" mt="1">
        {children}
      </Text>
    </Box>
  );
}

/** The three lists the backend asks for, leaving out what's 0. */
function Impact({ impact }: { impact: CustomerEraseImpact }) {
  const { erase, anonymise, keep, warnings } = impact;
  const deleted = listOf([
    "the customer",
    count(erase.vehicles, "vehicle", "vehicles"),
    count(erase.paperwork, "document (paperwork)", "documents (paperwork)"),
    count(erase.reminders, "reminder", "reminders"),
    count(erase.files, "file", "files"),
    count(erase.quotations ?? 0, "quote", "quotes"),
  ]);
  const work = listOf([
    count(anonymise.jobCards, "job card", "job cards"),
    count(anonymise.inspections, "inspection", "inspections"),
  ]);
  const kept = listOf([
    count(keep.invoices, "invoice", "invoices"),
    count(keep.paymentsReceived, "payment", "payments"),
  ]);
  const unlinked = warnings.unlinkedSameName;
  const unlinkedList = listOf([
    count(unlinked.invoices, "invoice", "invoices"),
    count(unlinked.jobCards, "job card", "job cards"),
    count(unlinked.inspections, "inspection", "inspections"),
    count(unlinked.quotations ?? 0, "quote", "quotes"),
  ]);

  return (
    <Stack gap="3">
      <ImpactList title="Deleted for good" tone="error">
        {deleted.charAt(0).toUpperCase() + deleted.slice(1)}.
      </ImpactList>

      {(work || anonymise.invoiceAddresses > 0) && (
        <ImpactList title="Kept, without their details" tone="gray">
          {work &&
            `${work}. The work stays; their name becomes "Erased customer", and their phone, email and plate number are removed. `}
          {anonymise.invoiceAddresses > 0 &&
            `Addresses are removed from ${count(anonymise.invoiceAddresses, "invoice", "invoices")}.`}
        </ImpactList>
      )}

      {kept && (
        <ImpactList title="Kept as they are (required by tax law)" tone="gray">
          The name and amounts on {kept}.
        </ImpactList>
      )}

      {unlinkedList && (
        <ImpactList title="Check these by hand" tone="warning">
          {unlinkedList} carry this name but aren&rsquo;t linked to this
          customer, so they won&rsquo;t be changed. Check them if they belong to
          the same person.
        </ImpactList>
      )}

      <Text textStyle="tiny-regular" color="gray.400">
        Notes and complaints typed on job cards aren&rsquo;t searched for the
        customer&rsquo;s details.
      </Text>
    </Stack>
  );
}

interface EraseCustomerDialogProps {
  customerId: string;
  onClose: () => void;
  /** After erasing: the customer is gone, so leave their page. */
  onErased: () => void;
}

/**
 * For a customer who asked to be forgotten: removes their details everywhere
 * it can, keeping only what tax law needs. Can't be undone.
 */
export function EraseCustomerDialog({
  customerId,
  onClose,
  onErased,
}: EraseCustomerDialogProps) {
  const { data, isLoading, isError, refetch } =
    useGetCustomerEraseImpactQuery(customerId);
  const { mutateAsync: erase, isPending } = useEraseCustomerMutation();
  const [confirmName, setConfirmName] = useState("");
  const [reason, setReason] = useState("");

  const impact = data?.data;
  const name = impact?.customer.name ?? "";
  const nameMatches = Boolean(name) && sameName(confirmName, name);

  const confirm = async () => {
    const result = await erase({
      id: customerId,
      payload: {
        confirmName,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      },
    });
    toaster.create({ type: "success", description: "Customer erased" });
    // Still erased; a few stored files were left behind.
    if (result.data.files.failed > 0) {
      toaster.create({
        type: "warning",
        duration: 10_000,
        description: `${result.data.files.failed} stored ${
          result.data.files.failed === 1 ? "file" : "files"
        } couldn't be removed. Contact support to have them deleted.`,
      });
    }
    onErased();
  };

  return (
    <Dialog.Root
      open
      placement="center"
      motionPreset="slide-in-bottom"
      scrollBehavior="inside"
      onOpenChange={({ open }) => !open && !isPending && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="32rem">
            <Dialog.Header pb="2">
              <Box>
                <Dialog.Title textStyle="h5-semibold" color="gray.500">
                  Erase {name || "customer"}?
                </Dialog.Title>
                <Text textStyle="small-regular" color="gray.300" mt="1">
                  For a customer who asked to be forgotten. This can&rsquo;t be
                  undone.
                </Text>
              </Box>
            </Dialog.Header>

            <Dialog.Body>
              {isLoading ? (
                <Center py="8">
                  <Spinner color="primary.300" />
                </Center>
              ) : isError || !impact ? (
                <Stack gap="3" py="4" align="flex-start">
                  <Text textStyle="small-regular" color="gray.400">
                    We couldn&rsquo;t work out what erasing would change.
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void refetch()}
                  >
                    Try again
                  </Button>
                </Stack>
              ) : (
                <Stack gap="5">
                  <Impact impact={impact} />
                  <CustomInput
                    label={`Type "${name}" to confirm`}
                    required
                    placeholder={name}
                    error={
                      confirmName && !nameMatches
                        ? "That isn't the customer's name"
                        : undefined
                    }
                    inputProps={{
                      value: confirmName,
                      autoComplete: "off",
                      onChange: (e) => setConfirmName(e.target.value),
                    }}
                  />
                  <CustomTextArea
                    label="Reason (optional). Don't include the customer's name"
                    placeholder="e.g. Asked by phone"
                    rows={2}
                    value={reason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setReason(e.target.value.slice(0, 500))
                    }
                  />
                </Stack>
              )}
            </Dialog.Body>

            <Dialog.Footer>
              <Flex gap="2" justify="flex-end" w="full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  bg="error.300"
                  color="white"
                  _hover={{ bg: "error.400" }}
                  disabled={!nameMatches}
                  loading={isPending}
                  onClick={() => void confirm()}
                >
                  Erase customer
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
