import { createDownloadLink } from "./file-helper";

/**
 * Converts an array of typed objects to a CSV file and triggers browser download.
 * @param data - Array of typed records to export
 * @param filename - Desired filename (without .csv extension)
 * @param headers - Optional mapping of key → column header label
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: Partial<Record<keyof T, string>>,
): void {
  if (!data.length) return;

  const keys = Object.keys(data[0]) as (keyof T)[];

  const headerRow = keys.map((key) => headers?.[key] ?? String(key)).join(",");

  const rows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key];
        if (value === null || value === undefined) return "";
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, newline or quote
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(","),
  );

  const csvContent = [headerRow, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  createDownloadLink(blob, `${filename}.csv`);
}
