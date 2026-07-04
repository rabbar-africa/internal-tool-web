import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { XIcon } from "@/assets/custom/XIcon";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
import { technicianFullName } from "@/shared/interface/technician";
import type { JobCardDetail } from "@/shared/interface/job-card";
import { useGetTechniciansQuery } from "@/features/technicians/api/query";
import {
  useAssignJobCardTechnicianMutation,
  useUnassignJobCardTechnicianMutation,
} from "../../api/query";

export function JobCardTechnicians({ jobCard }: { jobCard: JobCardDetail }) {
  const [selectedId, setSelectedId] = useState("");
  const [isLead, setIsLead] = useState(false);

  const { data: techniciansData, isLoading } = useGetTechniciansQuery({
    limit: 100,
    isActive: "true",
  });
  const { mutateAsync: assignTechnician, isPending: isAssigning } =
    useAssignJobCardTechnicianMutation();
  const { mutateAsync: unassignTechnician } =
    useUnassignJobCardTechnicianMutation();

  const assignments = useMemo(
    () => jobCard.technicians ?? [],
    [jobCard.technicians],
  );

  const availableOptions = useMemo(() => {
    const assignedIds = new Set(assignments.map((a) => a.technicianId));
    return (techniciansData?.data ?? [])
      .filter((technician) => !assignedIds.has(technician.id))
      .map((technician) => ({
        label: technicianFullName(technician),
        value: technician.id,
      }));
  }, [techniciansData?.data, assignments]);

  const handleAssign = async () => {
    if (!selectedId) return;
    await assignTechnician({
      jobCardId: jobCard.id,
      technicianId: selectedId,
      isLead,
    });
    setSelectedId("");
    setIsLead(false);
  };

  return (
    <Box
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.75"
      shadow="xs"
      p="5"
    >
      <Text textStyle="default-bold" color="gray.500" mb="4">
        Technicians
      </Text>

      <Stack gap="2" mb="4">
        {assignments.length === 0 && (
          <Text textStyle="small-regular" color="gray.300">
            No technicians assigned yet.
          </Text>
        )}
        {assignments.map((assignment) => (
          <Flex
            key={assignment.id}
            align="center"
            justify="space-between"
            px="3"
            py="2"
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.75"
          >
            <HStack gap="2">
              <Text textStyle="small-regular" color="gray.500" fontWeight="500">
                {technicianFullName(assignment.technician)}
              </Text>
              {assignment.technician.specialty && (
                <Text fontSize="12px" color="gray.300">
                  {assignment.technician.specialty}
                </Text>
              )}
              {assignment.isLead && (
                <Badge colorPalette="green" size="sm">
                  Lead
                </Badge>
              )}
            </HStack>
            <IconButton
              aria-label="Unassign technician"
              size="xs"
              variant="ghost"
              colorPalette="red"
              onClick={() =>
                unassignTechnician({
                  jobCardId: jobCard.id,
                  technicianId: assignment.technicianId,
                })
              }
            >
              <XIcon />
            </IconButton>
          </Flex>
        ))}
      </Stack>

      <Stack gap="3">
        <CustomSelect
          placeholder="Select technician to assign..."
          options={availableOptions}
          loading={isLoading}
          value={selectedId ? [selectedId] : undefined}
          onChange={(opt: { value: string[] }) =>
            setSelectedId(opt?.value?.[0] ?? "")
          }
        />
        <Flex justify="space-between" align="center" gap="3">
          <CustomCheckbox
            label="Assign as lead"
            checked={isLead}
            onCheckedChange={({ checked }) => setIsLead(checked === true)}
          />
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedId}
            loading={isAssigning}
            loadingText="Assigning..."
          >
            Assign
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}
