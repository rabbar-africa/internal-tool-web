import { useCallback, useMemo, useState } from "react";
import { Box, Button, Flex, Tabs, Text } from "@chakra-ui/react";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import {
  CustomTable,
  SelectionActionBar,
  type TableAction,
} from "@/components/table";
import ConsentDialog from "@/components/common/ConsentDialog";
import { toaster } from "@/components/ui";
import { TrashIcon } from "@/assets/custom/TrashIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { useDeleteExpensesBulkMutation } from "@/features/expenses/api/query";
import Status from "@/components/common/Status";
import { PlusIcon } from "@/assets/custom";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { ExportMenu, jobCardExportScope } from "@/features/exports/components";
import {
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_MODE_LABELS,
  type Expense,
} from "@/shared/interface/expense";
import type { PaymentModeDto } from "@/shared/interface/payment";
import {
  formatAccountLabel,
  useAccountOptions,
} from "@/features/settings/components/account-details/AccountSelect";
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
import { RecordExpenseModal } from "./RecordExpenseModal";

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
    cell: ({ row }) => (
      <Status
        name={(
          row.original.displayStatus ?? row.original.status
        )?.toLowerCase()}
      />
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

const PAYMENT_CSV_HEADERS = {
  paymentNumber: "Payment #",
  date: "Date",
  amount: "Amount",
  mode: "Mode",
  paidInto: "Paid Into",
  referenceNumber: "Reference #",
  status: "Status",
} as const;

// exportToCSV writes columns in the order of each row's keys.
const EXPENSE_CSV_HEADERS = {
  name: "Item",
  vehicle: "Vehicle",
  plateNumber: "Plate Number",
  amount: "Amount",
  date: "Date",
  paidFrom: "Paid From",
  expenseNumber: "Expense #",
  category: "Category",
  invoiceNumber: "Invoice",
  vendorName: "Supplier",
  quantity: "Quantity",
  unitCost: "Unit Cost",
  mode: "How It Was Paid",
} as const;

const modeLabel = (mode?: string | null) =>
  mode ? (PAYMENT_MODE_LABELS[mode as PaymentModeDto] ?? mode) : "";

export function JobCardTabs({ jobCard }: { jobCard: JobCardDetail }) {
  const navigate = useNavigate();
  // `?tab=` brings someone back to the tab they left, e.g. after recording costs.
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>(
    searchParams.get("tab") === "expenses" ? "expenses" : "invoices",
  );
  const [recordExpenseOpen, setRecordExpenseOpen] = useState(false);

  // Expenses ticked on the Expenses tab, by id, for deleting together.
  const { canDelete } = usePermissions();
  const [expenseSelection, setExpenseSelection] = useState<RowSelectionState>(
    {},
  );
  const [confirmDeleteExpenses, setConfirmDeleteExpenses] = useState(false);
  const { mutateAsync: deleteExpenses, isPending: isDeletingExpenses } =
    useDeleteExpensesBulkMutation();
  const selectedExpenses = useMemo(
    () => jobCard.expenses.filter((expense) => expenseSelection[expense.id]),
    [jobCard.expenses, expenseSelection],
  );

  const handleDeleteExpenses = async () => {
    const result = await deleteExpenses(
      selectedExpenses.map((expense) => expense.id),
    );
    const deleted = result.data?.deleted ?? 0;
    toaster.create({
      type: "success",
      description: `${deleted} ${deleted === 1 ? "expense" : "expenses"} deleted`,
    });
    setExpenseSelection({});
    setConfirmDeleteExpenses(false);
  };

  // The job card only carries each record's account id, so name them here.
  const { accounts } = useAccountOptions({ includeCash: true });
  const accountName = useCallback(
    (id?: string | null) => {
      const account = accounts.find((a) => a.id === id);
      return account ? formatAccountLabel(account) : "";
    },
    [accounts],
  );
  const expenseTableColumns = useMemo<ColumnDef<Expense>[]>(
    () => [
      ...expenseColumns,
      {
        id: "paidFrom",
        header: "Paid From",
        cell: ({ row }) => (
          <Text textStyle="small-regular" color="gray.500">
            {accountName(row.original.paidThroughAccountId) || "—"}
          </Text>
        ),
      },
    ],
    [accountName],
  );
  const paymentsCsv = jobCard.payments.map((payment) => ({
    paymentNumber: payment.paymentNumber,
    date: payment.date.slice(0, 10),
    amount: payment.amount,
    mode: modeLabel(payment.mode),
    paidInto: accountName(payment.depositToAccountId),
    referenceNumber: payment.referenceNumber ?? "",
    status: payment.status,
  }));
  // This endpoint doesn't work out a vehicle per expense, so it's the job's,
  // or the copy the job card keeps if the vehicle record has gone.
  const jobVehicleName = (
    jobCard.vehicle
      ? [jobCard.vehicle.year, jobCard.vehicle.make, jobCard.vehicle.model]
      : [jobCard.vehicleYear, jobCard.vehicleMake, jobCard.vehicleModel]
  )
    .filter(Boolean)
    .join(" ");
  const jobPlateNumber =
    jobCard.vehicle?.registrationNumber ??
    jobCard.vehicleRegistrationNumber ??
    "";
  const expensesCsv = jobCard.expenses.map((expense) => ({
    name: expense.name,
    vehicle: jobVehicleName,
    plateNumber: jobPlateNumber,
    amount: expense.amount,
    // A plain YYYY-MM-DD, which spreadsheets read as a date.
    date: expense.date.slice(0, 10),
    paidFrom: accountName(expense.paidThroughAccountId),
    expenseNumber: expense.expenseNumber,
    category: EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category,
    invoiceNumber:
      jobCard.invoices.find((invoice) => invoice.id === expense.invoiceId)
        ?.invoiceNumber ?? "",
    vendorName: expense.vendorName ?? "",
    quantity: expense.quantity,
    unitCost: expense.unitCost,
    mode: modeLabel(expense.paymentMode),
  }));
  // A void invoice's work isn't happening, so nothing to cost against it.
  const exportScope = jobCardExportScope(jobCard.id, jobCard.jobNumber);

  const costableInvoices = jobCard.invoices.filter(
    (invoice) => !["VOID", "DELETED"].includes(invoice.status?.toUpperCase()),
  );
  const recordOtherExpense = () =>
    navigate(`${RouteConstants.expenses.create.path}?jobCardId=${jobCard.id}`);
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
        navigate(
          RouteConstants.expenses.edit.generate(
            { id: expense.id },
            // So saving brings them back to this job card.
            { jobCardId: jobCard.id },
          ),
        ),
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
          onValueChange={({ value }) => {
            setActiveTab(value as TabValue);
            // Ticks belong to the Expenses tab; leaving it drops them.
            setExpenseSelection({});
          }}
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
            <Flex justify="flex-end" mb="3">
              <ExportMenu
                size="sm"
                data={paymentsCsv}
                filename={`${jobCard.jobNumber}-payments`}
                headers={PAYMENT_CSV_HEADERS}
                module="payments_received"
                scope={exportScope}
              />
            </Flex>
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
            <Flex justify="flex-end" gap="2" mb="3" wrap="wrap">
              <ExportMenu
                size="sm"
                data={expensesCsv}
                filename={`${jobCard.jobNumber}-expenses`}
                headers={EXPENSE_CSV_HEADERS}
                module="expenses"
                scope={exportScope}
              />
              <Button
                size="sm"
                onClick={() =>
                  // With nothing invoiced yet there's nothing to ask.
                  costableInvoices.length
                    ? setRecordExpenseOpen(true)
                    : recordOtherExpense()
                }
              >
                <PlusIcon />
                Add Expense
              </Button>
            </Flex>
            <CustomTable
              data={jobCard.expenses}
              columns={expenseTableColumns}
              enableActions
              actions={expenseActions}
              enableRowSelection={canDelete("expenses")}
              rowSelection={expenseSelection}
              onRowSelectionChange={setExpenseSelection}
              getRowId={(row) => row.id}
              showSelectionSummary={false}
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
      <RecordExpenseModal
        open={recordExpenseOpen}
        onClose={() => setRecordExpenseOpen(false)}
        invoices={costableInvoices}
        onSelectInvoice={(invoiceId) =>
          navigate(
            RouteConstants.invoices.costs.generate(
              { id: invoiceId },
              { jobCardId: jobCard.id },
            ),
          )
        }
        onSelectOther={recordOtherExpense}
      />
      <AttachFileModal
        open={attachFileOpen}
        onClose={() => setAttachFileOpen(false)}
        jobCardId={jobCard.id}
      />

      <SelectionActionBar
        count={activeTab === "expenses" ? selectedExpenses.length : 0}
        onClear={() => setExpenseSelection({})}
      >
        <Button
          size="sm"
          variant="outline"
          borderColor="error.300"
          color="error.300"
          _hover={{ bg: "error.50" }}
          onClick={() => setConfirmDeleteExpenses(true)}
        >
          <TrashIcon boxSize="3.5" />
          Delete ({selectedExpenses.length})
        </Button>
      </SelectionActionBar>

      <ConsentDialog
        open={confirmDeleteExpenses}
        onOpenChange={({ open }) => {
          if (!open && !isDeletingExpenses) setConfirmDeleteExpenses(false);
        }}
        heading={`Delete ${selectedExpenses.length} ${
          selectedExpenses.length === 1 ? "expense" : "expenses"
        }?`}
        note={`${formatCurrency(
          selectedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
        )} in total. They will no longer count against this job's profit.`}
        handleSubmit={() => void handleDeleteExpenses()}
        isLoading={isDeletingExpenses}
      />
    </>
  );
}
