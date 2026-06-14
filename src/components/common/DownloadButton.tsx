import { Button } from "@chakra-ui/react";
import { DownloadSimple } from "@/assets/custom/DownloadSimple";
import { exportToCSV } from "@/utils/exportToCSV";

interface DownloadButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename: string;
  headers?: Partial<Record<keyof T, string>>;
  label?: string;
}

export function DownloadButton<T extends Record<string, unknown>>({
  data,
  filename,
  headers,
  label = "Download CSV",
}: DownloadButtonProps<T>) {
  return (
    <Button
      variant="outline"
      size="sm"
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
