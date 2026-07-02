import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import type { DashboardAnalyticsFilter } from "../../interface";

type PresetKey = "30d" | "60d" | "90d" | "1y";

const PRESETS: Record<
  PresetKey,
  { label: string; days: number; trendMonths: number }
> = {
  "30d": { label: "Last 30 days", days: 30, trendMonths: 6 },
  "60d": { label: "Last 60 days", days: 60, trendMonths: 6 },
  "90d": { label: "Last 90 days", days: 90, trendMonths: 6 },
  "1y": { label: "Last 1 year", days: 365, trendMonths: 12 },
};

export const DEFAULT_PRESET: PresetKey = "30d";

const SELECT_OPTIONS = [
  ...Object.entries(PRESETS).map(([value, { label }]) => ({ value, label })),
  { value: "custom", label: "Custom range" },
];

/** Format a Date as a `yyyy-mm-dd` string in local time. */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Inclusive month span between two ISO dates, clamped to the DTO's 1–36. */
function monthsBetween(from: string, to: string): number {
  const f = new Date(from);
  const t = new Date(to);
  const months =
    (t.getFullYear() - f.getFullYear()) * 12 +
    (t.getMonth() - f.getMonth()) +
    1;
  return Math.min(36, Math.max(1, months));
}

/** Resolve a preset key into a concrete { from, to, trendMonths } filter. */
export function getPresetFilter(key: PresetKey): DashboardAnalyticsFilter {
  const preset = PRESETS[key];
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - preset.days);
  return {
    from: toISODate(from),
    to: toISODate(to),
    trendMonths: preset.trendMonths,
  };
}

interface DashboardFiltersProps {
  onChange: (filter: DashboardAnalyticsFilter) => void;
}

export function DashboardFilters({ onChange }: DashboardFiltersProps) {
  const [preset, setPreset] = useState<PresetKey | "custom">(DEFAULT_PRESET);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const today = toISODate(new Date());

  const emitCustom = (from: string, to: string) => {
    if (from && to && from <= to) {
      onChange({ from, to, trendMonths: monthsBetween(from, to) });
    }
  };

  const handlePresetChange = (value?: string) => {
    if (!value) return;

    if (value === "custom") {
      // Seed the custom range from the last 30 days so the fields start valid.
      const seed = getPresetFilter(DEFAULT_PRESET);
      const from = customFrom || seed.from || "";
      const to = customTo || seed.to || "";
      setPreset("custom");
      setCustomFrom(from);
      setCustomTo(to);
      emitCustom(from, to);
      return;
    }

    const key = value as PresetKey;
    setPreset(key);
    onChange(getPresetFilter(key));
  };

  return (
    <Flex
      gap="3"
      align="center"
      wrap="wrap"
      justify={{ base: "flex-start", sm: "flex-end" }}
    >
      {preset === "custom" && (
        <Flex gap="2" align="center" wrap="wrap">
          <DateField
            label="From"
            value={customFrom}
            max={customTo || today}
            onChange={(v) => {
              setCustomFrom(v);
              emitCustom(v, customTo);
            }}
          />
          <DateField
            label="To"
            value={customTo}
            min={customFrom}
            max={today}
            onChange={(v) => {
              setCustomTo(v);
              emitCustom(customFrom, v);
            }}
          />
        </Flex>
      )}

      <Box w="180px">
        <CustomSelect
          options={SELECT_OPTIONS}
          value={[preset]}
          onChange={(details: { value?: string[] } | null) =>
            handlePresetChange(details?.value?.[0])
          }
          controlProps={{ w: "100%" }}
        />
      </Box>
    </Flex>
  );
}
