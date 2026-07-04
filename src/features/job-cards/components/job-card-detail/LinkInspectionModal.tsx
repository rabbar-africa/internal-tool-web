import { useMemo, useState } from "react";
import { Button, Dialog, Flex, Portal, Stack } from "@chakra-ui/react";
import moment from "moment";
import { CustomSelect } from "@/components/input/CustomSelect";
import { useGetAllInspectionsQuery } from "@/features/inspection/api/query";
import { useLinkJobCardInspectionMutation } from "../../api/query";

interface LinkInspectionModalProps {
  open: boolean;
  onClose: () => void;
  jobCardId: string;
  /** Inspections already on the job card — excluded from the picker. */
  linkedInspectionIds: string[];
}

export function LinkInspectionModal({
  open,
  onClose,
  jobCardId,
  linkedInspectionIds,
}: LinkInspectionModalProps) {
  const [inspectionId, setInspectionId] = useState("");
  const { data, isLoading } = useGetAllInspectionsQuery(
    { limit: 100 },
    { enabled: open },
  );
  const { mutateAsync: linkInspection, isPending } =
    useLinkJobCardInspectionMutation();

  const options = useMemo(() => {
    const linked = new Set(linkedInspectionIds);
    return (data?.data ?? [])
      .filter((inspection) => !linked.has(inspection.id))
      .map((inspection) => ({
        label: `${inspection.jobCode} — ${moment(inspection.inspectionDate).format("DD MMM YYYY")}`,
        value: inspection.id,
      }));
  }, [data?.data, linkedInspectionIds]);

  const handleClose = () => {
    setInspectionId("");
    onClose();
  };

  const handleLink = async () => {
    if (!inspectionId) return;
    await linkInspection({ jobCardId, inspectionId });
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
                Link Existing Inspection
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body py="5">
              <Stack gap="4">
                <CustomSelect
                  label="Inspection"
                  placeholder="Select inspection..."
                  options={options}
                  loading={isLoading}
                  noOptionsText="No unlinked inspections found"
                  value={inspectionId ? [inspectionId] : undefined}
                  onChange={(opt: { value: string[] }) =>
                    setInspectionId(opt?.value?.[0] ?? "")
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
                  disabled={!inspectionId}
                  loading={isPending}
                  loadingText="Linking..."
                >
                  Link Inspection
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
