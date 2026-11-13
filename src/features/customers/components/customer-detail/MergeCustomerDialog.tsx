import { useMemo, useState } from "react";
import moment from "moment";
import {
  Box,
  Button,
  Center,
  Dialog,
  Flex,
  Grid,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import {
  ImpactBox,
  ImpactError,
  capitalise,
  countOf,
  listOf,
} from "@/components/common/delete-impact";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/utils/handle-error";
import type {
  CustomerMergeCounts,
  CustomerMergeSide,
} from "@/shared/interface/customer";
import {
  useGetAllCustomersQuery,
  useGetCustomerMergePreviewQuery,
  useMergeCustomerMutation,
} from "../../api/query";

const nameOf = (c: CustomerMergeSide) =>
  c.displayName?.trim() ||
  [c.firstName, c.lastName].filter(Boolean).join(" ") ||
  c.company ||
  "Unnamed customer";

/** Non-zero counts only, in the order a workshop thinks of them. */
const movesList = (moves: CustomerMergeCounts) =>
  listOf([
    countOf(moves.invoices, "invoice", "invoices"),
    countOf(moves.paymentsReceived, "payment", "payments"),
    countOf(moves.creditNotes, "credit note", "credit notes"),
    countOf(moves.quotations, "quote", "quotes"),
    countOf(moves.jobCards, "job card", "job cards"),
    countOf(moves.inspectionReports, "inspection", "inspections"),
    countOf(moves.vehicles, "vehicle", "vehicles"),
    countOf(moves.reminders, "reminder", "reminders"),
    countOf(moves.paperwork, "paperwork document", "paperwork documents"),
  ]);

const FIELD_LABELS: Record<string, string> = {
  firstName: "First name",
  middleName: "Middle name",
  lastName: "Last name",
  displayName: "Display name",
  jobTitle: "Job title",
  dob: "Date of birth",
  postalCode: "Postal code",
  consultedBy: "Consulted by",
  lastConsultationDate: "Last consultation",
  referralSource: "Referral source",
  utmSource: "UTM source",
  utmCampaign: "UTM campaign",
  utmMedium: "UTM medium",
  utmContent: "UTM content",
};

const fieldLabel = (key: string) =>
  FIELD_LABELS[key] ?? capitalise(key.replace(/([A-Z])/g, " $1").toLowerCase());

const DATE_FIELDS = new Set(["dob", "lastConsultationDate"]);
const fieldValue = (key: string, value: unknown) =>
  DATE_FIELDS.has(key) && typeof value === "string"
    ? moment(value).format("DD MMM YYYY")
    : String(value);

function Side({
  label,
  customer,
  tone,
}: {
  label: string;
  customer: CustomerMergeSide;
  tone: "error" | "primary";
}) {
  const details = [customer.phone, customer.email, customer.company].filter(
    Boolean,
  );
  return (
    <Box
      borderWidth="1px"
      borderColor={tone === "primary" ? "primary.300" : "gray.100"}
      rounded="md"
      p="3"
      minW={0}
    >
      <Text
        fontSize="11px"
        fontWeight="600"
        textTransform="uppercase"
        letterSpacing="0.04em"
        color={tone === "primary" ? "primary.400" : "error.300"}
      >
        {label}
      </Text>
      <Text textStyle="small-semibold" color="gray.500" mt="1" truncate>
        {nameOf(customer)}
      </Text>
      {details.length > 0 ? (
        details.map((d) => (
          <Text key={d} fontSize="12px" color="gray.400" truncate>
            {d}
          </Text>
        ))
      ) : (
        <Text fontSize="12px" color="gray.300">
          No contact details
        </Text>
      )}
    </Box>
  );
}

interface MergeCustomerDialogProps {
  /** The customer that goes. */
  customerId: string;
  customerName: string;
  onClose: () => void;
  /** After merging: open the customer that was kept. */
  onMerged: (keptId: string) => void;
}

/**
 * For a duplicate: everything of this customer moves to the one picked, and
 * this one is deleted. The kept customer's details only gain its blanks.
 */
export function MergeCustomerDialog({
  customerId,
  customerName,
  onClose,
  onMerged,
}: MergeCustomerDialogProps) {
  const [search, setSearch] = useState("");
  const [intoId, setIntoId] = useState("");
  const debounced = useDebounce(search, 400);

  const customersQuery = useGetAllCustomersQuery({
    page: 1,
    limit: 30,
    ...(debounced ? { search: debounced } : {}),
  });
  const options = useMemo(
    () =>
      (customersQuery.data?.data ?? [])
        .filter((c) => c.id !== customerId)
        .map((c) => ({
          label: c.displayName || `${c.firstName} ${c.lastName}`.trim(),
          value: c.id,
          subLabel: [c.phone, c.email].filter(Boolean).join(" · ") || undefined,
        })),
    [customersQuery.data?.data, customerId],
  );

  const previewQuery = useGetCustomerMergePreviewQuery(customerId, intoId);
  const preview = intoId ? previewQuery.data?.data : undefined;
  const { mutateAsync: merge, isPending } = useMergeCustomerMutation();

  const confirm = async () => {
    const result = await merge({ id: customerId, intoId });
    onMerged(result.data.customer?.id ?? intoId);
  };

  const moves = preview ? movesList(preview.moves) : "";
  const fills = Object.entries(preview?.fills ?? {});

  return (
    <Dialog.Root
      open
      placement="center"
      scrollBehavior="inside"
      onOpenChange={({ open }) => !open && !isPending && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="34rem">
            <Dialog.Header>
              <Box>
                <Dialog.Title textStyle="h5-semibold" color="gray.500">
                  Merge {customerName}
                </Dialog.Title>
                <Text textStyle="small-regular" color="gray.300" mt="1">
                  Pick the customer to keep. Everything moves to them, and{" "}
                  {customerName} is deleted. This can&rsquo;t be undone.
                </Text>
              </Box>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap="4">
                <SearchCombobox
                  label="Customer to keep"
                  required
                  placeholder="Search by name, phone or plate..."
                  options={options}
                  value={intoId || undefined}
                  onChange={(value) => setIntoId(value)}
                  onSearchChange={setSearch}
                  serverSearch
                  isLoading={customersQuery.isFetching}
                  disabled={isPending}
                />

                {intoId && previewQuery.isLoading && (
                  <Center py="4">
                    <Spinner size="sm" color="gray.300" />
                  </Center>
                )}

                {intoId && previewQuery.isError && (
                  <ImpactError
                    message={getErrorMessage(previewQuery.error)}
                    onRetry={() => void previewQuery.refetch()}
                  />
                )}

                {preview && (
                  <Stack gap="3">
                    <Grid templateColumns="1fr 1fr" gap="3">
                      <Side
                        label="Deleted"
                        customer={preview.merged}
                        tone="error"
                      />
                      <Side
                        label="Kept"
                        customer={preview.into}
                        tone="primary"
                      />
                    </Grid>

                    <Text textStyle="small-regular" color="gray.500">
                      Everything from{" "}
                      <Text as="span" fontWeight="600">
                        {nameOf(preview.merged)}
                      </Text>{" "}
                      moves to{" "}
                      <Text as="span" fontWeight="600">
                        {nameOf(preview.into)}
                      </Text>
                      , and {nameOf(preview.merged)} is deleted.
                    </Text>

                    <ImpactBox title="Moves across">
                      {moves
                        ? `${capitalise(moves)}.`
                        : "Nothing: they have no records yet."}
                    </ImpactBox>

                    {fills.length > 0 && (
                      <ImpactBox title={`Filled in on ${nameOf(preview.into)}`}>
                        <Stack gap="0.5">
                          {fills.map(([key, value]) => (
                            <Flex key={key} gap="2" wrap="wrap">
                              <Text color="gray.400">{fieldLabel(key)}:</Text>
                              <Text fontWeight="500" wordBreak="break-word">
                                {fieldValue(key, value)}
                              </Text>
                            </Flex>
                          ))}
                        </Stack>
                      </ImpactBox>
                    )}

                    <Text fontSize="12px" color="gray.400">
                      {nameOf(preview.into)}&rsquo;s own details don&rsquo;t
                      change; only blanks are filled in. Invoices already issued
                      keep the name printed on them.
                    </Text>
                  </Stack>
                )}
              </Stack>
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
                  loading={isPending}
                  loadingText="Merging..."
                  // Only once the preview for this pick is on screen.
                  disabled={!preview}
                  onClick={() => void confirm()}
                >
                  Merge customers
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
