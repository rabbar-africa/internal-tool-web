import { useState } from "react";
import {
  Button,
  Menu,
  Portal,
  Stack,
  Text,
  type ButtonProps,
} from "@chakra-ui/react";
import { CaretRight, DownloadSimple } from "@/assets/custom";
import { exportToCSV } from "@/utils/exportToCSV";
import type {
  ExportModuleKey,
  ExportScope,
  ServerExportView,
} from "@/shared/interface/export";
import { useGetExportCatalogQuery } from "../api";
import { useServerExport } from "../hooks/useServerExport";
import { AdvancedExportDrawer } from "./AdvancedExportDrawer";

interface ExportMenuProps<T extends Record<string, unknown>> {
  /** The rows on screen, for "Export current view". Unused with `serverView`. */
  data?: T[];
  /** The CSV's name when it is made in the browser. */
  filename?: string;
  headers?: Partial<Record<keyof T, string>>;
  /** Overrides "Export current view", e.g. "Export 3 selected". */
  currentViewLabel?: string;
  /** Has the server build "Export current view". Needs `module`. */
  serverView?: ServerExportView;
  /**
   * The backend module behind this list, which turns on "Advanced export".
   * Without one, or when the user may not export it, only the current view
   * can be exported.
   */
  module?: ExportModuleKey;
  /** Narrows the advanced export to what this page is about. */
  scope?: ExportScope;
  size?: ButtonProps["size"];
}

/**
 * "Export": the current view as a CSV, made in the browser from the rows on
 * screen or by the server with `serverView`, or an advanced export the server
 * builds from every record, in CSV, XLS or XLSX.
 */
export function ExportMenu<T extends Record<string, unknown>>({
  data = [],
  filename = "export",
  headers,
  currentViewLabel,
  serverView,
  module,
  scope,
  size,
}: ExportMenuProps<T>) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { run: runServerExport, isPending } = useServerExport(module);
  const { data: catalogData } = useGetExportCatalogQuery(Boolean(module));
  const catalog = catalogData?.data;
  // The catalog only lists modules this user may view.
  const canExportAdvanced = Boolean(
    module && catalog?.modules.some((m) => m.key === module),
  );

  const selectedCount = serverView?.selectedIds.length ?? 0;
  const rowCount = serverView ? selectedCount || serverView.total : data.length;
  const viewLabel =
    currentViewLabel ??
    (selectedCount
      ? `Export ${selectedCount} selected`
      : "Export current view");
  const viewHint = !rowCount
    ? "No rows to export"
    : selectedCount
      ? "Only the rows you ticked, as a CSV"
      : serverView
        ? "Everything in this list, as a CSV"
        : "The rows shown here, as a CSV";

  const exportView = () => {
    if (!serverView) {
      exportToCSV(data, filename, headers);
      return;
    }
    runServerExport({
      columns: serverView.columns,
      ...(selectedCount
        ? { ids: serverView.selectedIds }
        : { filters: serverView.filters }),
    });
  };

  return (
    <>
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <Button
            variant="outline"
            size={size}
            loading={isPending}
            borderColor="gray.100"
            color="gray.500"
            _hover={{ bg: "gray.50" }}
          >
            <DownloadSimple boxSize="4" />
            Export
            <CaretRight boxSize="3" transform="rotate(90deg)" />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="240px">
              <Menu.Item
                value="current-view"
                // Nothing to write with no rows: say so rather than seem broken.
                disabled={!rowCount}
                onClick={exportView}
                _hover={{ bg: "gray.50" }}
              >
                <Stack gap="0" py="1">
                  <Text textStyle="small-semibold" color="gray.500">
                    {viewLabel}
                  </Text>
                  <Text fontSize="12px" color="gray.300">
                    {viewHint}
                  </Text>
                </Stack>
              </Menu.Item>
              {canExportAdvanced && (
                <Menu.Item
                  value="advanced"
                  onClick={() => setAdvancedOpen(true)}
                  _hover={{ bg: "gray.50" }}
                >
                  <Stack gap="0" py="1">
                    <Text textStyle="small-semibold" color="gray.500">
                      Advanced export
                    </Text>
                    <Text fontSize="12px" color="gray.300">
                      Every record, as CSV, XLS or XLSX
                    </Text>
                  </Stack>
                </Menu.Item>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      {catalog && module && canExportAdvanced && (
        <AdvancedExportDrawer
          open={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          catalog={catalog}
          initialModule={module}
          scope={scope}
        />
      )}
    </>
  );
}
