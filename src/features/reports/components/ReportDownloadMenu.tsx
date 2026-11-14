import { Button, Menu, Portal, Stack, Text } from "@chakra-ui/react";
import { CaretRight, DownloadSimple } from "@/assets/custom";
import type { ReportParams } from "@/shared/interface/report";
import {
  useDownloadReportMutation,
  type ReportDownloadFormat,
} from "../api/query";

const FORMATS: Record<ReportDownloadFormat, { label: string; hint: string }> = {
  pdf: { label: "PDF", hint: "With your business header, ready to print" },
  csv: { label: "CSV", hint: "Plain values, for any spreadsheet" },
  xlsx: { label: "Excel (XLSX)", hint: "Keeps numbers as numbers" },
  xls: { label: "Excel 97-2004 (XLS)", hint: "For older versions of Excel" },
};

const isFormat = (value: string): value is ReportDownloadFormat =>
  value in FORMATS;

interface ReportDownloadMenuProps {
  reportKey: string;
  /** The same query as the screen, so the file matches what is shown. */
  params: ReportParams;
  /** From the catalog; PDF, CSV and XLSX when it doesn't say. */
  formats?: string[];
  disabled?: boolean;
}

export function ReportDownloadMenu({
  reportKey,
  params,
  formats,
  disabled,
}: ReportDownloadMenuProps) {
  const { mutate, isPending } = useDownloadReportMutation();
  const offered = (formats?.length ? formats : ["pdf", "csv", "xlsx"]).filter(
    isFormat,
  );

  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          loading={isPending}
          loadingText="Preparing..."
          disabled={disabled}
          borderColor="gray.100"
          color="gray.500"
          _hover={{ bg: "gray.50" }}
        >
          <DownloadSimple boxSize="4" />
          Download
          <CaretRight boxSize="3" transform="rotate(90deg)" />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="240px">
            {offered.map((format) => (
              <Menu.Item
                key={format}
                value={format}
                onClick={() => mutate({ key: reportKey, params, format })}
                _hover={{ bg: "gray.50" }}
              >
                <Stack gap="0" py="1">
                  <Text textStyle="small-semibold" color="gray.500">
                    {FORMATS[format].label}
                  </Text>
                  <Text fontSize="12px" color="gray.300">
                    {FORMATS[format].hint}
                  </Text>
                </Stack>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
