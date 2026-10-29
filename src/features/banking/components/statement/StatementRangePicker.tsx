import { useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import moment from "moment";
import { useUrlState } from "@/hooks/useUrlState";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import type { StatementRange } from "@/shared/interface/banking";

export type StatementPreset =
  | "this-month"
  | "last-month"
  | "this-year"
  | "custom";

const PRESET_OPTIONS: { label: string; value: StatementPreset }[] = [
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "last-month" },
  { label: "This year", value: "this-year" },
  { label: "Custom range", value: "custom" },
];

const DAY = "YYYY-MM-DD";

/** The dates a preset stands for; "this…" presets run up to today. */
export function presetRange(
  preset: Exclude<StatementPreset, "custom">,
): Required<StatementRange> {
  const today = moment();
  switch (preset) {
    case "last-month": {
      const last = today.clone().subtract(1, "month");
      return {
        from: last.clone().startOf("month").format(DAY),
        to: last.clone().endOf("month").format(DAY),
      };
    }
    case "this-year":
      return {
        from: today.clone().startOf("year").format(DAY),
        to: today.format(DAY),
      };
    default:
      return {
        from: today.clone().startOf("month").format(DAY),
        to: today.format(DAY),
      };
  }
}

const RANGE_SCHEMA = {
  preset: { defaultValue: "this-month" as StatementPreset },
  from: { defaultValue: "" },
  to: { defaultValue: "" },
};

/**
 * The statement period, kept in the URL (`preset`, plus `from`/`to` for a
 * custom range) so it survives a reload and carries from the Banking page to
 * an account's statement. Presets are recomputed on every visit ("this month"
 * moves). Dates are always sent, so screen, PDF and email cover the same days.
 */
export function useStatementRange() {
  const [filters, setFilters] = useUrlState(RANGE_SCHEMA, { replace: true });
  const range = useMemo<StatementRange>(
    () =>
      filters.preset === "custom"
        ? { from: filters.from || undefined, to: filters.to || undefined }
        : presetRange(filters.preset),
    [filters.preset, filters.from, filters.to],
  );
  const setRange = ({
    preset,
    from,
    to,
  }: { preset: StatementPreset } & StatementRange) =>
    setFilters({
      preset,
      from: preset === "custom" ? (from ?? "") : "",
      to: preset === "custom" ? (to ?? "") : "",
    });
  return { preset: filters.preset, range, setRange };
}

interface StatementRangePickerProps {
  preset: StatementPreset;
  range: StatementRange;
  onChange: (next: { preset: StatementPreset } & StatementRange) => void;
}

export function StatementRangePicker({
  preset,
  range,
  onChange,
}: StatementRangePickerProps) {
  return (
    <Flex
      gap="2"
      align={{ base: "stretch", md: "center" }}
      direction={{ base: "column", md: "row" }}
      w={{ base: "100%", md: "auto" }}
    >
      <CustomSelect
        options={PRESET_OPTIONS}
        value={[preset]}
        onChange={(opt: { value: string[] }) => {
          const next = (opt?.value?.[0] ?? "this-month") as StatementPreset;
          // Custom starts from the dates on screen, so it's a tweak, not a reset.
          onChange(
            next === "custom"
              ? { preset: next, ...range }
              : { preset: next, ...presetRange(next) },
          );
        }}
        rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
        controlProps={{ w: { base: "100%", md: "170px" } }}
      />
      {preset === "custom" && (
        <Flex gap="2" align="center">
          <DateField
            label="From"
            value={range.from ?? ""}
            max={range.to || undefined}
            onChange={(from) => onChange({ preset, ...range, from })}
            containerProps={{ flex: { base: "1", lg: "unset" } }}
          />
          <DateField
            label="To"
            value={range.to ?? ""}
            min={range.from || undefined}
            onChange={(to) => onChange({ preset, ...range, to })}
            containerProps={{ flex: { base: "1", lg: "unset" } }}
          />
        </Flex>
      )}
    </Flex>
  );
}
