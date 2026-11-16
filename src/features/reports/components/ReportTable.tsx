import { Fragment, useState, type KeyboardEvent } from "react";
import { Box, Flex, Table, chakra } from "@chakra-ui/react";
import { CaretRight } from "@/assets/custom";
import type {
  ReportCell,
  ReportColumn,
  ReportRow,
} from "@/shared/interface/report";
import { alignOf, formatCell, isNegative } from "./report-format";

interface ReportTableProps {
  columns: ReportColumn[];
  rows: ReportRow[];
  totals: Record<string, ReportCell> | null;
  currency: string;
  /** Where a row leads, or null. */
  hrefOf: (row: ReportRow) => string | null;
  onOpen: (href: string) => void;
}

const INDENT_REM = 1.25;
const CELL_PX = "1rem";

/**
 * One table for every report: the columns the API sends, in order, with rows
 * nested under rows (collapsible), heading / subtotal / total rows drawn as
 * the API marks them, and the totals row last.
 *
 * Not `CustomTable`: a report needs nested, styled rows and a totals row,
 * which a list table doesn't have; it keeps the same look.
 */
export function ReportTable({
  columns,
  rows,
  totals,
  currency,
  hrefOf,
  onOpen,
}: ReportTableProps) {
  // Rows are open unless closed; keyed by their place in the tree.
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const toggle = (path: string) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const renderRow = (row: ReportRow, path: string, depth: number) => {
    const children = row.children ?? [];
    const hasChildren = children.length > 0;
    const isOpen = !closed.has(path);
    const href = hrefOf(row);
    const isHeading = row.style === "heading";
    const bold = Boolean(row.style);

    const open = () => href && onOpen(href);
    const onKeyDown = (e: KeyboardEvent) => {
      if (href && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        open();
      }
    };

    return (
      <Fragment key={path}>
        <Table.Row
          bg={row.style === "total" ? "gray.50" : "white"}
          cursor={href ? "pointer" : "default"}
          _hover={href ? { bg: "gray.50" } : undefined}
          onClick={href ? open : undefined}
          onKeyDown={href ? onKeyDown : undefined}
          tabIndex={href ? 0 : undefined}
          role={href ? "link" : undefined}
          data-testid="report-row"
        >
          {columns.map((column, i) => {
            const value = row.cells[column.key];
            const first = i === 0;
            // A heading is a title: its figures, if any, aren't shown.
            const text =
              isHeading && !first
                ? ""
                : formatCell(value, column.type, currency);
            return (
              <Table.Cell
                key={column.key}
                textAlign={alignOf(column.type)}
                fontSize=".875rem"
                fontWeight={bold ? "600" : "400"}
                color={
                  isNegative(value, column.type)
                    ? "red.500"
                    : first && href
                      ? "primary.400"
                      : "gray.500"
                }
                borderBottom="1px solid"
                borderBottomColor="gray.75"
                borderTop={row.style === "subtotal" ? "1px solid" : undefined}
                borderTopColor="gray.200"
                py=".7rem"
                px={CELL_PX}
                pl={first ? `${1 + depth * INDENT_REM}rem` : CELL_PX}
                whiteSpace={first ? "normal" : "nowrap"}
                minW={first ? "200px" : undefined}
              >
                {first ? (
                  <Flex align="center" gap="1.5">
                    {hasChildren ? (
                      <chakra.button
                        type="button"
                        aria-label={isOpen ? "Collapse" : "Expand"}
                        aria-expanded={isOpen}
                        onClick={(e) => {
                          // Folding a row doesn't open it.
                          e.stopPropagation();
                          toggle(path);
                        }}
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        boxSize="5"
                        rounded="sm"
                        color="gray.400"
                        flexShrink={0}
                        _hover={{ bg: "gray.100" }}
                      >
                        <CaretRight
                          boxSize="2.5"
                          transform={isOpen ? "rotate(90deg)" : undefined}
                          transition="transform 0.15s"
                        />
                      </chakra.button>
                    ) : depth > 0 || anyNested ? (
                      // Lines up with siblings that can fold.
                      <Box boxSize="5" flexShrink={0} />
                    ) : null}
                    <Box as="span">{text}</Box>
                  </Flex>
                ) : (
                  text
                )}
              </Table.Cell>
            );
          })}
        </Table.Row>
        {hasChildren &&
          isOpen &&
          children.map((child, i) =>
            renderRow(child, `${path}.${i}`, depth + 1),
          )}
      </Fragment>
    );
  };

  const anyNested = rows.some((r) => (r.children?.length ?? 0) > 0);

  return (
    <Table.ScrollArea
      borderWidth="1px"
      borderColor="gray.75"
      rounded="md"
      w="100%"
      bg="white"
    >
      <Table.Root size="sm" bg="white">
        <Table.Header>
          <Table.Row bg="gray.50">
            {columns.map((column, i) => (
              <Table.ColumnHeader
                key={column.key}
                textAlign={alignOf(column.type)}
                fontSize=".8125rem"
                fontWeight="500"
                color="gray.400"
                py=".75rem"
                px={CELL_PX}
                pl={i === 0 ? "1rem" : CELL_PX}
                whiteSpace="nowrap"
                borderBottom="1px solid"
                borderBottomColor="gray.75"
              >
                {column.label}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, i) => renderRow(row, String(i), 0))}
          {totals && (
            <Table.Row bg="gray.50" data-testid="report-totals">
              {columns.map((column, i) => {
                const value = totals[column.key];
                const text =
                  i === 0
                    ? formatCell(value, column.type, currency) || "Total"
                    : formatCell(value, column.type, currency);
                return (
                  <Table.Cell
                    key={column.key}
                    textAlign={alignOf(column.type)}
                    fontSize=".875rem"
                    fontWeight="700"
                    color={
                      isNegative(value, column.type) ? "red.500" : "gray.500"
                    }
                    borderTop="1px solid"
                    borderTopColor="gray.200"
                    py=".8rem"
                    px={CELL_PX}
                    pl={i === 0 ? "1rem" : CELL_PX}
                    whiteSpace="nowrap"
                  >
                    {text}
                  </Table.Cell>
                );
              })}
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
