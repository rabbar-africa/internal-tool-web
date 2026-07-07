import { useState } from "react";
import { Box, Button, Flex, Tabs, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CustomTable, type TableAction } from "@/components/table";
import Status from "@/components/common/Status";
import { PlusIcon } from "@/assets/custom";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import {
  EXPENSE_CATEGORY_LABELS,
  type Expense,
} from "@/shared/interface/expense";
import type {
  JobCardDetail,
  JobCardFile,
  JobCardInspection,
  JobCardInvoice,
  JobCardPayment,
} from "@/shared/interface/job-card";
import {
  useRemoveJobCardFileMutation,
  useUnlinkJobCardInspectionMutation,
  useUnlinkJobCardInvoiceMutation,
} from "../../api/query";
import { LinkInvoiceModal } from "./LinkInvoiceModal";
import { LinkInspectionModal } from "./LinkInspectionModal";
import { AttachFileModal } from "./AttachFileModal";

const scrollAreaProps = { maxW: { base: "xl", lg: "7xl" } };

const invoiceColumns: ColumnDef<JobCardInvoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as string)}
      </Text>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatCurrency(getValue() as string)}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <Status name={(getValue() as string)?.toLowerCase()} />
    ),
  },
];

const paymentColumns: ColumnDef<JobCardPayment>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as string)}
      </Text>
    ),
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {((getValue() as string) || "—").replace(/_/g, " ")}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <Status name={(getValue() as string)?.toLowerCase()} />
    ),
  },
];

const inspectionColumns: ColumnDef<JobCardInspection>[] = [
  {
    accessorKey: "jobCode",
    header: "Job Code",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "inspectionDate",
    header: "Inspection Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <Status name={(getValue() as string)?.toLowerCase()} />
    ),
  },
];

const expenseColumns: ColumnDef<Expense>[] = [
  {
    accessorKey: "expenseNumber",
    header: "Expense #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {EXPENSE_CATEGORY_LABELS[getValue() as Expense["category"]] ??
          (getValue() as string)}
      </Text>
    ),
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as string)}
      </Text>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
];

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileColumns: ColumnDef<JobCardFile>[] = [
  {
    accessorKey: "fileName",
    header: "File",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="primary.300" fontWeight="500">
        {row.original.fileName || row.original.fileUrl.split("/").pop()}
      </Text>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => (
      <Text
        textStyle="small-regular"
        color="gray.500"
        textTransform="capitalize"
      >
        {((getValue() as string | null) || "—").toLowerCase()}
      </Text>
    ),
  },
  {
    accessorKey: "fileSize",
    header: "Size",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatFileSize(getValue() as number | null)}
      </Text>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Uploaded",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
];

type TabValue = "invoices" | "payments" | "inspections" | "expenses" | "files";

export function JobCardTabs({ jobCard }: { jobCard: JobCardDetail }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("invoices");
  const [linkInvoiceOpen, setLinkInvoiceOpen] = useState(false);
  const [linkInspectionOpen, setLinkInspectionOpen] = useState(false);
  const [attachFileOpen, setAttachFileOpen] = useState(false);

  const { mutateAsync: unlinkInvoice } = useUnlinkJobCardInvoiceMutation();
  const { mutateAsync: unlinkInspection } =
    useUnlinkJobCardInspectionMutation();
  const { mutateAsync: removeFile } = useRemoveJobCardFileMutation();

  const invoiceActions: TableAction<JobCardInvoice>[] = [
    {
      label: "View",
      value: "view",
      onClick: (invoice) =>
        navigate(RouteConstants.invoices.detail.generate({ id: invoice.id })),
    },
    {
      label: "Unlink",
      value: "unlink",
      variant: "destructive",
      separator: true,
      onClick: (invoice) =>
        unlinkInvoice({ jobCardId: jobCard.id, invoiceId: invoice.id }),
    },
  ];

  const inspectionActions: TableAction<JobCardInspection>[] = [
    {
      label: "View",
      value: "view",
      onClick: (inspection) =>
        navigate(
          RouteConstants.inspection.inspectionDetails.generate({
            id: inspection.id,
          }),
        ),
    },
    {
      label: "Unlink",
      value: "unlink",
      variant: "destructive",
      separator: true,
      onClick: (inspection) =>
        unlinkInspection({
          jobCardId: jobCard.id,
          inspectionId: inspection.id,
        }),
    },
  ];

  const expenseActions: TableAction<Expense>[] = [
    {
      label: "Edit",
      value: "edit",
      onClick: (expense) =>
        navigate(RouteConstants.expenses.edit.generate({ id: expense.id })),
    },
  ];

  const fileActions: TableAction<JobCardFile>[] = [
    {
      label: "Open",
      value: "open",
      onClick: (file) => window.open(file.fileUrl, "_blank"),
    },
    {
      label: "Remove",
      value: "remove",
      variant: "destructive",
      separator: true,
      onClick: (file) => removeFile({ jobCardId: jobCard.id, fileId: file.id }),
    },
  ];

  const addButton = (label: string, onClick: () => void) => (
    <Button
      size="sm"
      variant="outline"
      borderColor="primary.300"
      color="primary.300"
      onClick={onClick}
    >
      <PlusIcon />
      {label}
    </Button>
  );

  return (
    <>
      <Box
        bg="white"
        rounded="xl"
        borderWidth="1px"
        borderColor="gray.75"
        shadow="xs"
        overflow="hidden"
      >
        <Tabs.Root
          value={activeTab}
          onValueChange={({ value }) => setActiveTab(value as TabValue)}
        >
          <Tabs.List
            px="6"
            pt="3"
            borderBottomWidth="1px"
            borderColor="gray.75"
            bg="gray.50/50"
          >
            <Tabs.Trigger value="invoices" fontSize="13px">
              Invoices ({jobCard.invoices.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="payments" fontSize="13px">
              Payments ({jobCard.payments.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="inspections" fontSize="13px">
              Inspections ({jobCard.inspections.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="expenses" fontSize="13px">
              Expenses ({jobCard.expenses.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="files" fontSize="13px">
              Files ({jobCard.files.length})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="invoices" px="4" pb="4" pt="3">
            <Flex justify="flex-end" gap="2" mb="3">
              {addButton("Link Invoice", () => setLinkInvoiceOpen(true))}
              <Button
                size="sm"
                onClick={() =>
                  navigate(
                    `${RouteConstants.invoices.create.path}?jobCardId=${jobCard.id}`,
                  )
                }
              >
                <PlusIcon />
                New Invoice
              </Button>
            </Flex>
            <CustomTable
              data={jobCard.invoices}
              columns={invoiceColumns}
              enableActions
              actions={invoiceActions}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.invoices.detail.generate({
                    id: row.original.id,
                  }),
                )
              }
              tableScrollAreaProps={scrollAreaProps}
            />
          </Tabs.Content>

          <Tabs.Content value="payments" px="4" pb="4" pt="3">
            {/* <Flex justify="flex-end" mb="3">
              <Button
                size="sm"
                onClick={() => navigate(RouteConstants.payments.create.path)}
              >
                <PlusIcon />
                Record Payment
              </Button>
            </Flex> */}
            <CustomTable
              data={jobCard.payments}
              columns={paymentColumns}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.payments.detail.generate({
                    id: row.original.id,
                  }),
                )
              }
              tableScrollAreaProps={scrollAreaProps}
            />
          </Tabs.Content>

          <Tabs.Content value="inspections" px="4" pb="4" pt="3">
            <Flex justify="flex-end" mb="3">
              {addButton("Link Inspection", () => setLinkInspectionOpen(true))}
            </Flex>
            <CustomTable
              data={jobCard.inspections}
              columns={inspectionColumns}
              enableActions
              actions={inspectionActions}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.inspection.inspectionDetails.generate({
                    id: row.original.id,
                  }),
                )
              }
              tableScrollAreaProps={scrollAreaProps}
            />
          </Tabs.Content>

          <Tabs.Content value="expenses" px="4" pb="4" pt="3">
            <Flex justify="flex-end" mb="3">
              <Button
                size="sm"
                onClick={() =>
                  navigate(
                    `${RouteConstants.expenses.create.path}?jobCardId=${jobCard.id}`,
                  )
                }
              >
                <PlusIcon />
                Add Expense
              </Button>
            </Flex>
            <CustomTable
              data={jobCard.expenses}
              columns={expenseColumns}
              enableActions
              actions={expenseActions}
              tableScrollAreaProps={scrollAreaProps}
            />
          </Tabs.Content>

          <Tabs.Content value="files" px="4" pb="4" pt="3">
            <Flex justify="flex-end" mb="3">
              {addButton("Attach File", () => setAttachFileOpen(true))}
            </Flex>
            <CustomTable
              data={jobCard.files}
              columns={fileColumns}
              enableActions
              actions={fileActions}
              onRowClick={(row) => window.open(row.original.fileUrl, "_blank")}
              tableScrollAreaProps={scrollAreaProps}
            />
          </Tabs.Content>
        </Tabs.Root>
      </Box>

      <LinkInvoiceModal
        open={linkInvoiceOpen}
        onClose={() => setLinkInvoiceOpen(false)}
        jobCardId={jobCard.id}
        clientId={jobCard.clientId}
        linkedInvoiceIds={jobCard.invoices.map((invoice) => invoice.id)}
      />
      <LinkInspectionModal
        open={linkInspectionOpen}
        onClose={() => setLinkInspectionOpen(false)}
        jobCardId={jobCard.id}
        linkedInspectionIds={jobCard.inspections.map(
          (inspection) => inspection.id,
        )}
      />
      <AttachFileModal
        open={attachFileOpen}
        onClose={() => setAttachFileOpen(false)}
        jobCardId={jobCard.id}
      />
    </>
  );
}
