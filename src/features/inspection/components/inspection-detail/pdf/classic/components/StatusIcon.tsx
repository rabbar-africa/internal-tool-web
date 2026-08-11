import { Svg, Path, Circle } from "@react-pdf/renderer";
import { px } from "../colors";
import { STATUS_CONFIG, type Bucket } from "../constants";

/**
 * Status is always shown as icon plus a text label, never color alone, so the
 * report survives greyscale printing. Geometry matches the source template's
 * inline SVGs.
 */
export function StatusIcon({
  bucket,
  size = px(16),
}: {
  bucket: Bucket;
  size?: number;
}) {
  const color = STATUS_CONFIG[bucket].text;

  if (bucket === "pass") {
    return (
      <Svg width={size} height={size} viewBox="0 0 16 16">
        <Circle cx="8" cy="8" r="7" stroke={color} strokeWidth={1.5} />
        <Path
          d="M5 8l2 2 4-4"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (bucket === "warning") {
    return (
      <Svg width={size} height={size} viewBox="0 0 16 16">
        <Path
          d="M8 2.5L13.5 13H2.5L8 2.5z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <Path
          d="M8 6.5v3"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Circle cx="8" cy="11" r="0.75" fill={color} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx="8" cy="8" r="7" stroke={color} strokeWidth={1.5} />
      <Path
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
