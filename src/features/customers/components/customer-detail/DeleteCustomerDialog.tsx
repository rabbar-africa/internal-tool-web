import { useState } from "react";
import {
  Button,
  Center,
  chakra,
  Dialog,
  Flex,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  ImpactBox,
  ImpactError,
  TickOption,
  capitalise,
  countOf,
  listOf,
} from "@/components/common/delete-impact";
import { usePermissions } from "@/hooks/usePermissions";
import type {
  CustomerDeleteAlternative,
  CustomerDeleteImpact,
  CustomerDeleteVehicle,
} from "@/shared/interface/customer";
import {
  useDeleteCustomerMutation,
  useGetCustomerDeleteImpactQuery,
  useUpdateCustomerMutation,
} from "../../api/query";

/** The plate, or the make and model when there's no plate yet. */
export const vehicleName = (v: CustomerDeleteVehicle) =>
  v.registrationNumber ||
  [v.make, v.model].filter(Boolean).join(" ") ||
  "A vehicle";

interface DeleteCustomerDialogProps {
  customerId: string;
  customerName: string;
  onClose: () => void;
  /** After deleting: the customer is gone, so leave their page. */
  onDeleted: () => void;
  /** Blocked: the ways out, opened by the parent. */
  onMerge: () => void;
  onErase: () => void;
}

const ALTERNATIVES: Record<
  CustomerDeleteAlternative,
  { title: string; detail: string }
> = {
  merge: {
    title: "Merge into another customer",
    detail:
      "For a duplicate. Their invoices, payments and everything else move to the customer you keep.",
  },
  deactivate: {
    title: "Mark inactive",
    detail: "They stay, with all their records.",
  },
  erase: {
    title: "Erase customer…",
    detail:
      "They asked to be forgotten. Their details are removed; tax records are kept.",
  },
};

/** Not blocked: what goes, what stays, and the one optional extra. */
function Allowed({
  impact,
  deleteVehicles,
  setDeleteVehicles,
}: {
  impact: CustomerDeleteImpact;
  deleteVehicles: boolean;
  setDeleteVehicles: (value: boolean) => void;
}) {
  const deleted = listOf([
    countOf(impact.reminders, "reminder", "reminders"),
    countOf(
      impact.paperwork.count,
      "paperwork document",
      "paperwork documents",
    ),
    impact.paperwork.files > 0 &&
      `their ${countOf(impact.paperwork.files, "file", "files")}`,
  ]);
  const kept = listOf([
    countOf(impact.jobCards, "job card", "job cards"),
    countOf(impact.quotations, "quote", "quotes"),
    countOf(impact.inspections, "inspection", "inspections"),
  ]);
  const { withHistory, bare } = impact.vehicles;
  const bareNames = bare.map(vehicleName).join(", ");

  return (
    <Stack gap="3">
      <Text textStyle="small-regular" color="gray.400">
        This can&rsquo;t be undone.
      </Text>

      {deleted && (
        <ImpactBox title="Deleted with them" tone="error">
          {capitalise(deleted)}.
        </ImpactBox>
      )}

      {(kept || withHistory.length > 0) && (
        <ImpactBox title="Kept">
          {kept && (
            <Text>
              {capitalise(kept)}, no longer linked to them. Their name stays on
              each.
            </Text>
          )}
          {withHistory.length > 0 && (
            <Text mt={kept ? "1" : "0"}>
              {capitalise(
                countOf(
                  withHistory.length,
                  "vehicle with records",
                  "vehicles with records",
                )!,
              )}{" "}
              ({withHistory.map(vehicleName).join(", ")}) stay without an owner,
              still found by plate.
            </Text>
          )}
        </ImpactBox>
      )}

      {bare.length > 0 && (
        <TickOption
          label={`Also delete their ${countOf(
            bare.length,
            "vehicle",
            "vehicles",
          )} with no records`}
          checked={deleteVehicles}
          onChange={setDeleteVehicles}
          disabled={!impact.can.deleteVehicles}
          disabledHint={`You don't have permission to delete vehicles. ${bareNames} stay without an owner.`}
          hint={
            deleteVehicles
              ? `${bareNames} will be deleted.`
              : `Unticked, ${bareNames} stay without an owner.`
          }
        />
      )}
    </Stack>
  );
}

/**
 * Asks the API what deleting the customer touches before anyone confirms. A
 * customer with invoices, payments or credit notes can't be deleted; they're
 * offered merge, inactive or erase instead.
 */
export function DeleteCustomerDialog({
  customerId,
  customerName,
  onClose,
  onDeleted,
  onMerge,
  onErase,
}: DeleteCustomerDialogProps) {
  const { canUpdate, canDelete } = usePermissions();
  const { data, isLoading, isError, refetch } =
    useGetCustomerDeleteImpactQuery(customerId);
  const { mutateAsync: deleteCustomer, isPending: isDeleting } =
    useDeleteCustomerMutation();
  const { mutateAsync: updateCustomer, isPending: isDeactivating } =
    useUpdateCustomerMutation(customerId);
  const [deleteVehicles, setDeleteVehicles] = useState(false);

  const impact = data?.data;
  const busy = isDeleting || isDeactivating;
  const isInactive = impact?.customer.status?.toUpperCase() === "INACTIVE";

  // Each way out needs what its own endpoint needs.
  const offered = (impact?.blocked?.alternatives ?? []).filter((alt) => {
    if (alt === "merge") return canUpdate("clients") && canDelete("clients");
    if (alt === "deactivate") return canUpdate("clients") && !isInactive;
    return canDelete("clients");
  });

  const confirmDelete = async () => {
    try {
      await deleteCustomer({ id: customerId, deleteVehicles });
      onDeleted();
    } catch {
      // Already toasted. A 409 means a money record appeared meanwhile: ask
      // again, so the modal shows the ways out instead.
      void refetch();
    }
  };

  const deactivate = async () => {
    await updateCustomer({ status: "INACTIVE" });
    onClose();
  };

  const choose = (alt: CustomerDeleteAlternative) => {
    if (alt === "merge") onMerge();
    else if (alt === "erase") onErase();
    else void deactivate();
  };

  return (
    <Dialog.Root
      open
      placement="center"
      scrollBehavior="inside"
      onOpenChange={({ open }) => !open && !busy && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="32rem">
            <Dialog.Header>
              <Dialog.Title textStyle="h5-semibold" color="gray.500">
                Delete {impact?.customer.displayName || customerName}?
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {isLoading ? (
                <Center py="6">
                  <Spinner size="sm" color="gray.300" />
                </Center>
              ) : isError || !impact ? (
                <ImpactError
                  message="We couldn't check what this customer has."
                  onRetry={() => void refetch()}
                />
              ) : impact.blocked ? (
                <Stack gap="3">
                  <ImpactBox
                    title="This customer can't be deleted"
                    tone="warning"
                  >
                    {impact.blocked.message}
                  </ImpactBox>
                  {offered.map((alt) => (
                    <chakra.button
                      key={alt}
                      type="button"
                      textAlign="left"
                      borderWidth="1px"
                      borderColor={alt === "merge" ? "primary.300" : "gray.100"}
                      rounded="md"
                      p="3"
                      cursor="pointer"
                      _hover={{ bg: "gray.25" }}
                      _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
                      disabled={busy}
                      onClick={() => choose(alt)}
                    >
                      <Flex align="center" gap="2">
                        <Text textStyle="small-semibold" color="gray.500">
                          {ALTERNATIVES[alt].title}
                        </Text>
                        {alt === "deactivate" && isDeactivating && (
                          <Spinner size="xs" color="gray.300" />
                        )}
                      </Flex>
                      <Text fontSize="12px" color="gray.400" mt="0.5">
                        {ALTERNATIVES[alt].detail}
                      </Text>
                    </chakra.button>
                  ))}
                </Stack>
              ) : (
                <Allowed
                  impact={impact}
                  deleteVehicles={deleteVehicles}
                  setDeleteVehicles={setDeleteVehicles}
                />
              )}
            </Dialog.Body>

            <Dialog.Footer>
              <Flex gap="2" justify="flex-end" w="full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={busy}
                >
                  {impact?.blocked ? "Close" : "Cancel"}
                </Button>
                {!impact?.blocked && (
                  <Button
                    size="sm"
                    bg="error.300"
                    color="white"
                    _hover={{ bg: "error.400" }}
                    loading={isDeleting}
                    loadingText="Deleting..."
                    // Nobody confirms without seeing what is attached.
                    disabled={!impact}
                    onClick={() => void confirmDelete()}
                  >
                    Delete customer
                  </Button>
                )}
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
