import { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@chakra-ui/react";
import { useGetExportCatalogQuery } from "../api";
import { AdvancedExportDrawer } from "./AdvancedExportDrawer";

interface ExportDataButtonProps extends Omit<ButtonProps, "onClick"> {
  children?: ReactNode;
}

/**
 * Opens the export dialog on the first module this user may export, for
 * places that aren't one list, such as before deleting the business. Renders
 * nothing when they may export none.
 */
export function ExportDataButton({
  children = "Export your data",
  ...buttonProps
}: ExportDataButtonProps) {
  const [open, setOpen] = useState(false);
  const { data } = useGetExportCatalogQuery();
  const catalog = data?.data;
  const firstModule = catalog?.modules[0]?.key;
  if (!catalog || !firstModule) return null;

  return (
    <>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <AdvancedExportDrawer
        open={open}
        onClose={() => setOpen(false)}
        catalog={catalog}
        initialModule={firstModule}
      />
    </>
  );
}
