import { Flex } from "@chakra-ui/react";
import { MenuFilter } from "@/components/input/MenuFilter";
import { FAINT_DIVIDER } from "@/theme/surfaces";
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

/** The order the statuses are listed in: the everyday ones first. */
const PILL_ORDER = [
  "",
  "DRAFT",
  "SENT",
  "OVERDUE",
  "PARTIALLY_PAID",
  "PAID",
  "VOID",
  "WRITTEN_OFF",
  "CLOSED",
];
const STATUS_CHOICES = [...STATUS_OPTIONS].sort(
  (a, b) => PILL_ORDER.indexOf(a.value) - PILL_ORDER.indexOf(b.value),
);

/**
 * The top of the invoice list card: status, the date range and the search,
 * in one row over a hairline.
 */
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
      align={{ base: "stretch", lg: "center" }}
      justify="space-between"
      direction={{ base: "column", lg: "row" }}
      gap="3"
      px={{ base: "3", md: "4" }}
      py="3"
      borderBottomWidth="1px"
      borderColor={FAINT_DIVIDER}
    >
      <Flex gap="2" align="center" wrap="wrap">
        <MenuFilter
          label="Status"
          value={status}
          options={STATUS_CHOICES}
          onChange={onStatusChange}
          triggerProps={{ flex: { base: "1 1 100%", sm: "0 0 auto" } }}
        />
        <DateField
          label="From"
          value={dueDateFrom}
          max={dueDateTo || undefined}
          onChange={onDueDateFromChange}
          containerProps={{ flex: { base: "1", sm: "unset" } }}
        />
        <DateField
          label="To"
          value={dueDateTo}
          min={dueDateFrom || undefined}
          onChange={onDueDateToChange}
          containerProps={{ flex: { base: "1", sm: "unset" } }}
        />
      </Flex>

      <SearchInput
        placeholder="Search number or customer"
        value={searchInput}
        onChange={onSearchInputChange}
        onSearch={onSearchCommit}
        debounceMs={400}
        loading={isLoading}
        width={{ base: "100%", lg: "18rem" }}
      />
    </Flex>
  );
}
