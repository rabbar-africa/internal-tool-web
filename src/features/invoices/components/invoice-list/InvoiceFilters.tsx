import { Flex } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { SearchInput } from "@/components/input/SearchInput";
import { STATUS_OPTIONS } from "./columns";

interface InvoiceFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchCommit: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  dueDateFrom: string;
  dueDateTo: string;
  onDueDateFromChange: (value: string) => void;
  onDueDateToChange: (value: string) => void;
  isLoading?: boolean;
}

export function InvoiceFilters({
  searchInput,
  onSearchInputChange,
  onSearchCommit,
  status,
  onStatusChange,
  dueDateFrom,
  dueDateTo,
  onDueDateFromChange,
  onDueDateToChange,
  isLoading,
}: InvoiceFiltersProps) {
  return (
    <Flex
      justifyContent="flex-start"
      alignItems={{ base: "stretch", md: "center" }}
      mb="1.5rem"
      gap="3"
      direction={{ base: "column", md: "row" }}
      wrap="wrap"
    >
      <CustomSelect
        placeholder="All Status"
        options={STATUS_OPTIONS}
        value={status ? [status] : undefined}
        onChange={(opt: { value: string[] }) =>
          onStatusChange(opt?.value?.[0] ?? "")
        }
        rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
        controlProps={{ w: { base: "100%", md: "140px" } }}
      />

      <Flex
        flexWrap={{ base: "wrap", lg: "unset" }}
        gap="2"
        align="center"
        w={{ base: "100%", md: "auto" }}
      >
        <DateField
          label="From"
          value={dueDateFrom}
          max={dueDateTo || undefined}
          onChange={onDueDateFromChange}
          containerProps={{ flex: { base: "1", lg: "unset" } }}
        />
        <DateField
          label="To"
          value={dueDateTo}
          min={dueDateFrom || undefined}
          onChange={onDueDateToChange}
          containerProps={{ flex: { base: "1", lg: "unset" } }}
        />
      </Flex>

      <SearchInput
        placeholder="Search by invoice # or customer"
        value={searchInput}
        onChange={onSearchInputChange}
        onSearch={onSearchCommit}
        debounceMs={500}
        loading={isLoading}
        width={{ base: "100%", md: "21rem" }}
      />
    </Flex>
  );
}
