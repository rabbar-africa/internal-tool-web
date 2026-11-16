import { useMemo, useState } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import { SearchInput } from "@/components/input/SearchInput";
import {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
} from "@/features/customers/api/query";
import {
  useGetJobCardByIdQuery,
  useGetJobCardsQuery,
} from "@/features/job-cards/api/query";
import { AccountFilterSelect } from "@/features/settings/components/account-details/AccountSelect";
import { useDebounce } from "@/hooks/useDebounce";
import type { ReportFilterDef } from "@/shared/interface/report";
import { humanise } from "./report-format";

/** Stands for "no filter" in the pickers, which can't hold an empty value. */
const ALL = "__all__";

interface FilterProps {
  filter: ReportFilterDef;
  value: string;
  onChange: (value: string) => void;
}

interface Option {
  label: string;
  value: string;
}

function customerName(c: {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
}) {
  return (
    c.displayName?.trim() ||
    [c.firstName, c.lastName].filter(Boolean).join(" ").trim() ||
    c.company ||
    "Unnamed customer"
  );
}

/** A picker that searches on the server and keeps "All" at the top. */
function RecordPicker({
  label,
  options,
  selected,
  value,
  onChange,
  onSearch,
  isLoading,
  placeholder,
}: {
  label: string;
  options: Option[];
  /** The chosen record, which may not be among the search results. */
  selected?: Option;
  value: string;
  onChange: (value: string) => void;
  onSearch: (text: string) => void;
  isLoading: boolean;
  placeholder: string;
}) {
  const all = { label: `All ${label.toLowerCase()}`, value: ALL };
  const list = [
    all,
    ...(selected && !options.some((o) => o.value === selected.value)
      ? [selected]
      : []),
    ...options,
  ];
  return (
    <SearchCombobox
      placeholder={placeholder}
      options={list}
      value={value || ALL}
      onChange={(next) => onChange(next === ALL ? "" : next)}
      onSearchChange={onSearch}
      serverSearch
      isLoading={isLoading}
    />
  );
}

function CustomerFilter({ value, onChange }: FilterProps) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const query = useGetAllCustomersQuery({
    page: 1,
    limit: 30,
    ...(debounced ? { search: debounced } : {}),
  });
  const chosen = useGetCustomerByIdQuery(value);
  const options = useMemo(
    () =>
      (query.data?.data ?? []).map(
        (c: Parameters<typeof customerName>[0] & { id: string }) => ({
          label: customerName(c),
          value: c.id,
        }),
      ),
    [query.data?.data],
  );
  const chosenData = chosen.data?.data;
  return (
    <RecordPicker
      label="Customers"
      placeholder="Search customers..."
      options={options}
      selected={
        value && chosenData
          ? { label: customerName(chosenData), value }
          : undefined
      }
      value={value}
      onChange={onChange}
      onSearch={setSearch}
      isLoading={query.isFetching}
    />
  );
}

function JobCardFilter({ value, onChange }: FilterProps) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const query = useGetJobCardsQuery({
    page: 1,
    limit: 30,
    ...(debounced ? { search: debounced } : {}),
  });
  const chosen = useGetJobCardByIdQuery(value);
  const labelOf = (j: { jobNumber: string; customerName?: string | null }) =>
    j.customerName ? `${j.jobNumber} · ${j.customerName}` : j.jobNumber;
  const options = useMemo(
    () =>
      (query.data?.data ?? []).map((j) => ({ label: labelOf(j), value: j.id })),
    [query.data?.data],
  );
  const chosenData = chosen.data?.data;
  return (
    <RecordPicker
      label="Job cards"
      placeholder="Search job cards..."
      options={options}
      selected={
        value && chosenData ? { label: labelOf(chosenData), value } : undefined
      }
      value={value}
      onChange={onChange}
      onSearch={setSearch}
      isLoading={query.isFetching}
    />
  );
}

function EnumFilter({ filter, value, onChange }: FilterProps) {
  const all = `All ${filter.label.toLowerCase()}`;
  return (
    <CustomSelect
      placeholder={all}
      options={[
        { value: ALL, label: all },
        ...(filter.options ?? []).map((o) => ({
          value: o,
          label: humanise(o),
        })),
      ]}
      value={[value || ALL]}
      onChange={(opt: { value: string[] }) => {
        const next = opt?.value?.[0] ?? ALL;
        onChange(next === ALL ? "" : next);
      }}
      rootProps={{ size: "sm", w: "100%" }}
      controlProps={{ w: "100%" }}
    />
  );
}

function TextFilter({ filter, value, onChange }: FilterProps) {
  const [text, setText] = useState(value);
  return (
    <SearchInput
      placeholder={filter.label}
      value={text}
      onChange={setText}
      onSearch={onChange}
      debounceMs={500}
      width="100%"
    />
  );
}

/** The control for one of the report's filters, by its type and key. */
function FilterControl(props: FilterProps) {
  const { filter, value, onChange } = props;
  switch (filter.type) {
    case "enum":
      return <EnumFilter {...props} />;
    case "date":
      return (
        <DateField
          label={filter.label}
          value={value}
          onChange={onChange}
          containerProps={{ w: "100%" }}
        />
      );
    case "text":
      return <TextFilter {...props} />;
    case "id":
      if (filter.key === "customerId") return <CustomerFilter {...props} />;
      if (filter.key === "jobCardId") return <JobCardFilter {...props} />;
      if (/AccountId$/.test(filter.key)) {
        return (
          <AccountFilterSelect value={value} onChange={onChange} fullWidth />
        );
      }
      // An id the page has no picker for yet: nothing sensible to type.
      return null;
  }
}

interface ReportFiltersProps {
  filters: ReportFilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

/** The report's own filters, from the API, in one wrapping row. */
export function ReportFilters({
  filters,
  values,
  onChange,
  onClear,
}: ReportFiltersProps) {
  // Clearing starts the typed-in filters afresh too.
  const [cleared, setCleared] = useState(0);
  if (!filters.length) return null;
  const anySet = filters.some((f) => values[f.key]);
  return (
    <Flex gap="3" wrap="wrap" align="center">
      {filters.map((filter) => (
        <Box key={filter.key} flex="1 1 180px" minW="0" maxW={{ md: "260px" }}>
          <FilterControl
            key={cleared}
            filter={filter}
            value={values[filter.key] ?? ""}
            onChange={(value) => onChange(filter.key, value)}
          />
        </Box>
      ))}
      {anySet && (
        <Button
          size="sm"
          variant="ghost"
          flexShrink={0}
          onClick={() => {
            onClear();
            setCleared((n) => n + 1);
          }}
        >
          Clear filters
        </Button>
      )}
    </Flex>
  );
}
