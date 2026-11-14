import { Flex } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import {
  RANGE_PRESETS,
  presetRange,
  type DayRange,
  type RangePreset,
} from "../hooks/useReportParams";

interface RangeProps {
  preset: RangePreset;
  range: DayRange;
  onChange: (next: { preset: RangePreset } & Partial<DayRange>) => void;
}

/** From–to: a preset, or a custom pair of days (both included). */
export function ReportRangePicker({ preset, range, onChange }: RangeProps) {
  return (
    <Flex gap="2" align="center" wrap="wrap" flex="1 1 auto" minW="0">
      <CustomSelect
        options={RANGE_PRESETS}
        value={[preset]}
        onChange={(opt: { value: string[] }) => {
          const next = (opt?.value?.[0] ?? "this-month") as RangePreset;
          // Custom starts from the days on screen, so it's a tweak, not a reset.
          onChange(
            next === "custom"
              ? { preset: next, ...range }
              : { preset: next, ...presetRange(next) },
          );
        }}
        rootProps={{ size: "sm", w: { base: "100%", sm: "auto" } }}
        controlProps={{ w: { base: "100%", sm: "160px" } }}
      />
      {preset === "custom" && (
        <Flex
          gap="2"
          align="center"
          flex={{ base: "1 1 100%", sm: "0 1 auto" }}
        >
          <DateField
            label="From"
            value={range.from}
            max={range.to || undefined}
            onChange={(from) => onChange({ preset, ...range, from })}
            containerProps={{ flex: "1", minW: "0" }}
          />
          <DateField
            label="To"
            value={range.to}
            min={range.from || undefined}
            onChange={(to) => onChange({ preset, ...range, to })}
            containerProps={{ flex: "1", minW: "0" }}
          />
        </Flex>
      )}
    </Flex>
  );
}

/** One day: the position at the end of it. */
export function ReportAsOfPicker({
  asOf,
  onChange,
}: {
  asOf: string;
  onChange: (day: string) => void;
}) {
  return (
    <DateField
      label="As of"
      value={asOf}
      onChange={(day) => day && onChange(day)}
      containerProps={{ w: { base: "100%", sm: "auto" } }}
    />
  );
}
