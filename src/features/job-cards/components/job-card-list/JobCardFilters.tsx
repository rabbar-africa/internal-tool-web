import { Box, Flex } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { SearchInput } from "@/components/input/SearchInput";
import { JOB_CARD_STATUS_OPTIONS } from "@/shared/interface/job-card";
import { technicianFullName } from "@/shared/interface/technician";
import { useGetTechniciansQuery } from "@/features/technicians/api/query";

interface JobCardFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchCommit: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  technicianId: string;
  onTechnicianChange: (value: string) => void;
  isLoading?: boolean;
}

export function JobCardFilters({
  searchInput,
  onSearchInputChange,
  onSearchCommit,
  status,
  onStatusChange,
  technicianId,
  onTechnicianChange,
  isLoading,
}: JobCardFiltersProps) {
  const { data: techniciansData, isLoading: techniciansLoading } =
    useGetTechniciansQuery({ limit: 100 });

  const technicianOptions = (techniciansData?.data ?? []).map((technician) => ({
    label: technicianFullName(technician),
    value: technician.id,
  }));

  return (
    <Flex
      justifyContent="flex-start"
      alignItems={{ base: "stretch", md: "center" }}
      mb="1.5rem"
      gap="3"
      direction={{ base: "column", md: "row" }}
      wrap="wrap"
    >
      <Box>
        <CustomSelect
          placeholder="All Statuses"
          options={JOB_CARD_STATUS_OPTIONS}
          value={status ? [status] : undefined}
          onChange={(opt: { value: string[] }) =>
            onStatusChange(opt?.value?.[0] ?? "")
          }
          rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
          controlProps={{ w: { base: "100%", md: "170px" } }}
        />
      </Box>

      <Box>
        <CustomSelect
          placeholder="All Technicians"
          options={technicianOptions}
          loading={techniciansLoading}
          value={technicianId ? [technicianId] : undefined}
          onChange={(opt: { value: string[] }) =>
            onTechnicianChange(opt?.value?.[0] ?? "")
          }
          rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
          controlProps={{ w: { base: "100%", md: "180px" } }}
        />
      </Box>

      <SearchInput
        placeholder="Search by job #, customer, reg. no or complaint"
        value={searchInput}
        onChange={onSearchInputChange}
        onSearch={onSearchCommit}
        debounceMs={500}
        loading={isLoading}
        width={{ base: "100%", md: "23rem" }}
      />
    </Flex>
  );
}
