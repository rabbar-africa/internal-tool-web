import { Button, type ButtonProps } from "@chakra-ui/react";
import { DownloadSimple } from "@/assets/custom/DownloadSimple";
import { exportToCSV } from "@/utils/exportToCSV";

interface DownloadButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename: string;
  headers?: Partial<Record<keyof T, string>>;
  label?: string;
  size?: ButtonProps["size"];
  /** The export does nothing with no rows, so say so rather than seem broken. */
  disabled?: boolean;
}

export function DownloadButton<T extends Record<string, unknown>>({
  data,
  filename,
  headers,
  label = "Download CSV",
  size,
  disabled,
}: DownloadButtonProps<T>) {
  return (
    <Button
      variant="outline"
      size={size}
      disabled={disabled}
      onClick={() => exportToCSV(data, filename, headers)}
      borderColor="gray.100"
      color="gray.500"
      _hover={{ bg: "gray.50" }}
    >
      <DownloadSimple boxSize="4" />
      {label}
    </Button>
  );
}
