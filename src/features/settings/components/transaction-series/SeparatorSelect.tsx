import { CustomSelect } from "@/components/input";

/** Stands for "no separator": a select item can't have an empty value. */
const NONE = "none";

const SEPARATOR_OPTIONS = [
  { label: "Hyphen ( - )  e.g. INV-000123", value: "-" },
  { label: "Slash ( / )  e.g. INV/000123", value: "/" },
  { label: "Dot ( . )  e.g. INV.000123", value: "." },
  { label: "Underscore ( _ )  e.g. INV_000123", value: "_" },
  { label: "None  e.g. INV000123", value: NONE },
];

/** The character between a number's prefix, digits and suffix. */
export function SeparatorSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (separator: string) => void;
}) {
  // A separator saved before this was a select stays selectable, not lost.
  const isCustom =
    Boolean(value) && !SEPARATOR_OPTIONS.some((o) => o.value === value);
  const options = isCustom
    ? [...SEPARATOR_OPTIONS, { label: `Current ( ${value} )`, value }]
    : SEPARATOR_OPTIONS;

  return (
    <CustomSelect
      label="Separator"
      options={options}
      value={[value || NONE]}
      onChange={(opt: { value: string[] }) => {
        const next = opt?.value?.[0] ?? NONE;
        onChange(next === NONE ? "" : next);
      }}
    />
  );
}
