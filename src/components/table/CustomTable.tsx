import {
  Flex,
  Table,
  IconButton,
  Spinner,
  Text,
  Box,
  type InputProps,
  type TableColumnHeaderProps,
  type TableScrollAreaProps,
} from "@chakra-ui/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
  type TableOptions,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import type { ReactNode, MouseEvent } from "react";
import { useMemo, useCallback } from "react";
import { CustomCheckbox } from "../input/CustomCheckBox";
import { ActionMenu, type TableAction } from "./ActionMenu";
import { PaginationControls } from "./PaginationControls";

// Re-export TableAction for convenience
export type { TableAction };

export interface CustomTableProps<T = any> {
  // Data & Columns
  data: T[];
  columns: ColumnDef<T, any>[];

  // Selection
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  getRowId?: (row: T, index: number) => string;

  // Sorting
  sorting?: SortingState;
  setSorting?: (sorting: SortingState) => void;
  enableSorting?: boolean;

  // Pagination
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination?: (pagination: { pageIndex: number; pageSize: number }) => void;
  pageCount?: number;
  totalItems?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;

  // Actions
  actions?: TableAction<T>[];
  enableActions?: boolean;

  // UI States
  loading?: boolean;
  NoDataText?: string | ReactNode;

  // Event Handlers
  onRowClick?: (row: Row<T>, event: MouseEvent) => void;

  // Styling & Layout
  tableHeader?: ReactNode;
  maxHeight?: string;
  stickyHeader?: boolean;

  // Advanced
  tableOptions?: Partial<TableOptions<T>>;
  filter?: {
    tableName: string;
    inputProps?: InputProps;
  };
  total?: number;
  tableHeaderProps?: TableColumnHeaderProps;
  tableScrollAreaProps?: TableScrollAreaProps;
}

// Row Selection Checkbox Component
interface RowCheckboxProps<T> {
  row: Row<T>;
}

function RowCheckbox<T>({ row }: RowCheckboxProps<T>) {
  return <CustomCheckbox aria-label={`Select row ${row.id}`} />;
}

// Header Checkbox Component
interface HeaderCheckboxProps {
  table: any;
}

function HeaderCheckbox({ table }: HeaderCheckboxProps) {
  return (
    <CustomCheckbox
      aria-label={`Select all rows ${table.getIsAllRowsSelected()}`}
    />
  );
}

// Main Table Component
export function CustomTable<T = any>({
  data = [],
  columns: baseColumns,

  // Selection
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
  getRowId,

  // Sorting
  sorting = [],
  setSorting,
  enableSorting = false,

  // Pagination
  pagination,
  setPagination,
  pageCount,
  totalItems,
  hasNextPage,
  hasPrevPage,

  // Actions
  actions = [],
  enableActions = false,

  // UI States
  loading = false,
  NoDataText = "No data available",

  // Event Handlers
  onRowClick,

  // Styling & Layout
  tableHeader,
  maxHeight = "600px",
  stickyHeader = false,

  // Advanced
  tableOptions = {},
  tableHeaderProps,
  tableScrollAreaProps,
}: CustomTableProps<T>) {
  // Memoized columns with selection and actions
  const columns = useMemo(() => {
    const finalColumns = [...baseColumns];

    // Add selection column
    if (enableRowSelection) {
      finalColumns.unshift({
        id: "select",
        header: ({ table }) => <HeaderCheckbox table={table} />,
        cell: ({ row }) => <RowCheckbox row={row} />,
        enableSorting: false,
        enableResizing: false,
        size: 50,
        meta: { disableRowClick: true },
      });
    }

    // Add actions column
    if (enableActions && actions.length > 0) {
      finalColumns.push({
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => <ActionMenu row={row} actions={actions} />,
        enableSorting: false,
        enableResizing: false,
        size: 80,
        meta: { disableRowClick: true },
      });
    }

    return finalColumns;
  }, [baseColumns, enableRowSelection, enableActions, actions]);

  // Table configuration
  const tableConfig = useMemo(
    () => ({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),

      // Selection
      enableRowSelection,
      onRowSelectionChange,
      getRowId,

      // Sorting
      enableSorting,
      onSortingChange: setSorting,

      // Pagination
      ...(pagination &&
        setPagination && {
          manualPagination: true,
          pageCount: pageCount ?? -1,
          onPaginationChange: setPagination,
        }),

      // State
      state: {
        sorting,
        rowSelection,
        ...(pagination && { pagination }),
      },

      // Additional options
      renderFallbackValue: undefined,
      ...tableOptions,
    }),
    [
      data,
      columns,
      enableRowSelection,
      onRowSelectionChange,
      getRowId,
      enableSorting,
      setSorting,
      sorting,
      rowSelection,
      pagination,
      setPagination,
      pageCount,
      tableOptions,
    ],
  );

  const table = useReactTable(tableConfig as any);

  // Row click handler
  const handleRowClick = useCallback(
    (row: Row<T>, event: MouseEvent) => {
      if (onRowClick) {
        onRowClick(row, event);
      }
    },
    [onRowClick],
  );

  // Pagination handler
  const handlePaginationChange = (newPage: number) => {
    if (setPagination && pagination) {
      setPagination({
        pageIndex: newPage - 1,
        pageSize: pagination.pageSize,
      });
    }
  };

  const currentPage = pagination ? pagination.pageIndex + 1 : 1;
  const totalPages = pageCount || 1;

  return (
    <Box>
      {tableHeader}

      <Table.ScrollArea
        rounded="md"
        maxH={maxHeight}
        css={{
          WebkitScrollbar: {
            height: "8px",
            width: "8px",
          },
          "::WebkitScrollbarTrack": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "::WebkitScrollbarThumb": {
            background: "#888",
            borderRadius: "4px",
          },
          "::WebkitScrollbarThumb:hover": {
            background: "#555",
          },
          /* Firefox */
          scrollbarWidth: "thin",
          scrollbarColor: "#888 #f1f1f1",
        }}
        w="100%"
        {...tableScrollAreaProps}
      >
        <Table.Root
          border={"1px solid #EBEBEB"}
          variant="outline"
          bg="white"
          stickyHeader={stickyHeader}
        >
          <Table.Header bg="gray.50">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} bg="gray.50">
                {headerGroup.headers.map((header, index) => {
                  const isLast = index + 1 === headerGroup.headers.length;
                  return (
                    <Table.ColumnHeader
                      key={header.id}
                      py={".812rem"}
                      fontFamily="body"
                      fontSize=".875rem"
                      fontWeight="400"
                      textTransform="capitalize"
                      borderBottom="1px solid #EBEBEB"
                      color="black"
                      pl="1.6rem"
                      pr={isLast ? "1rem" : "unset"}
                      position={stickyHeader ? "sticky" : "static"}
                      top={stickyHeader ? 0 : "auto"}
                      zIndex={stickyHeader ? 10 : "auto"}
                      {...tableHeaderProps}
                    >
                      {header.isPlaceholder ? null : (
                        <Flex
                          gap=".5rem"
                          cursor={
                            header.column.getCanSort() ? "pointer" : "default"
                          }
                          onClick={header.column.getToggleSortingHandler()}
                          align="center"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanSort() && (
                            <Box ml="auto">
                              {{
                                asc: "↑",
                                desc: "↓",
                              }[header.column.getIsSorted() as string] ?? "↕"}
                            </Box>
                          )}
                        </Flex>
                      )}
                    </Table.ColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>

          <Table.Body bg="white">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length} border="transparent">
                  <Flex w={"100%"} justify="center" align="center" h="200px">
                    <Spinner size="lg" />
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ) : !data.length ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length} border="transparent">
                  <Flex justify="center" align="center" h="200px">
                    <Text
                      color="gray.500"
                      fontSize="lg"
                      textStyle={"small-regular"}
                    >
                      {NoDataText}
                    </Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ) : (
              table.getRowModel().rows.map((row: any) => (
                <Table.Row
                  key={row.id}
                  bg="white"
                  _hover={
                    onRowClick
                      ? { cursor: "pointer", bg: "gray.50" }
                      : { cursor: "default" }
                  }
                  onClick={(event) => handleRowClick(row, event)}
                >
                  {row.getVisibleCells().map((cell: any) => {
                    const disableRowClick =
                      cell.column.columnDef.meta?.disableRowClick;

                    return (
                      <Table.Cell
                        key={cell.id}
                        fontWeight="500"
                        fontSize=".875rem"
                        border="transparent"
                        pl="1.6rem"
                        borderBottom="1px solid #EBEBEB"
                        py=".8rem"
                        onClick={(e) => {
                          if (disableRowClick) {
                            e.stopPropagation();
                          }
                        }}
                        _hover={
                          disableRowClick
                            ? { bg: "transparent", cursor: "default" }
                            : { cursor: "pointer" }
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {pagination && pageCount && pageCount > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onPageChange={handlePaginationChange}
          totalItems={totalItems}
          itemsPerPage={pagination.pageSize}
        />
      )}

      {enableRowSelection && Object.keys(rowSelection).length > 0 && (
        <Flex
          justify="space-between"
          align="center"
          mt="4"
          p="3"
          bg="blue.50"
          rounded="md"
        >
          <Text fontSize="sm" color="blue.700">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </Text>
          <IconButton
            size="sm"
            variant="ghost"
            onClick={() => table.resetRowSelection()}
            aria-label="Clear selection"
          >
            ✕
          </IconButton>
        </Flex>
      )}
    </Box>
  );
}
