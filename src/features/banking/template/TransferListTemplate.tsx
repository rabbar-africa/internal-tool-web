import { useMemo, useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { CustomTable, type TableAction } from "@/components/table";
import { DateField } from "@/components/input/DateField";
import { PageHeader } from "@/components/common/PageHeader";
import ConsentDialog from "@/components/common/ConsentDialog";
import { PermissionGate } from "@/components/common/PermissionGate";
import { usePermissions } from "@/hooks/usePermissions";
import { useUrlState } from "@/hooks/useUrlState";
import { formatCurrency } from "@/utils/calculations";
import {
  AccountFilterSelect,
  formatAccountLabel,
  useAccountOptions,
} from "@/features/settings/components/account-details/AccountSelect";
import type { IAccountTransfer } from "@/shared/interface/banking";
import {
  useDeleteAccountTransferMutation,
  useGetAccountTransfersQuery,
} from "../api";
import { TransferModal, type TransferKind } from "../components/TransferModal";
import { RecordTransferMenu } from "../components/RecordTransferMenu";

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  accountId: { defaultValue: "" },
  dateFrom: { defaultValue: "" },
  dateTo: { defaultValue: "" },
};

const columns: ColumnDef<IAccountTransfer>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment((getValue() as string).slice(0, 10)).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    id: "from",
    header: "From",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatAccountLabel(row.original.fromAccount)}
      </Text>
    ),
  },
  {
    id: "to",
    header: "To",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatAccountLabel(row.original.toAccount)}
      </Text>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-semibold" color="gray.500">
        {formatCurrency(Number(getValue()) || 0)}
      </Text>
    ),
  },
  {
    accessorKey: "referenceNumber",
    header: "Reference",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400">
        {(getValue() as string | null) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400" lineClamp={1}>
        {(getValue() as string | null) || "—"}
      </Text>
    ),
  },
];

export function TransferListTemplate() {
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const { canUpdate, canDelete } = usePermissions();
  const navigate = useNavigate();
  // "Statement" opens the filtered account, else the primary.
  const { accounts } = useAccountOptions({ includeCash: true });
  const statementAccountId =
    filters.accountId ||
    accounts.find((a) => a.isPrimary && a.type === "BANK")?.id ||
    accounts[0]?.id;

  const { data, isLoading } = useGetAccountTransfersQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.accountId ? { accountId: filters.accountId } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  });
  const transfers = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;

  const { mutateAsync: deleteTransfer, isPending: isDeleting } =
    useDeleteAccountTransferMutation();

  const [modal, setModal] = useState<{
    kind: TransferKind;
    transfer?: IAccountTransfer;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IAccountTransfer | null>(
    null,
  );

  const actions: TableAction<IAccountTransfer>[] = [
    ...(canUpdate("banking")
      ? [
          {
            label: "Edit",
            value: "edit",
            onClick: (row: IAccountTransfer) =>
              setModal({ kind: "transfer", transfer: row }),
          },
        ]
      : []),
    ...(canDelete("banking")
      ? [
          {
            label: "Delete",
            value: "delete",
            variant: "destructive" as const,
            separator: true,
            onClick: (row: IAccountTransfer) => setPendingDelete(row),
          },
        ]
      : []),
  ];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteTransfer(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Account Transfers"
          subtitle="Cash banked, cash withdrawn and money moved between your accounts"
          action={
            <Flex gap="2" flexWrap="wrap">
              {statementAccountId && (
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      RouteConstants.banking.statement.generate({
                        id: statementAccountId,
                      }),
                    )
                  }
                >
                  Statement
                </Button>
              )}
              <PermissionGate anyOf={["create:banking"]}>
                <RecordTransferMenu
                  onSelect={(kind) => setModal({ kind, transfer: undefined })}
                />
              </PermissionGate>
            </Flex>
          }
        />

        <Box
          pt={{ base: "1.25rem", md: "2rem" }}
          pb={{ base: "1.25rem", md: "2rem" }}
          bg="white"
          px={{ base: "0.75rem", md: "1rem" }}
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Flex
            justifyContent="flex-start"
            alignItems={{ base: "stretch", md: "center" }}
            mb="1.5rem"
            gap="3"
            direction={{ base: "column", md: "row" }}
            wrap="wrap"
          >
            <AccountFilterSelect
              value={filters.accountId}
              onChange={(id) => setFilters({ accountId: id, page: 1 })}
            />
            <Flex gap="2" align="center" w={{ base: "100%", md: "auto" }}>
              <DateField
                label="From"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(val) => setFilters({ dateFrom: val, page: 1 })}
                containerProps={{ flex: { base: "1", lg: "unset" } }}
              />
              <DateField
                label="To"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(val) => setFilters({ dateTo: val, page: 1 })}
                containerProps={{ flex: { base: "1", lg: "unset" } }}
              />
            </Flex>
          </Flex>

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              data={transfers}
              columns={columns}
              loading={isLoading}
              enableActions={actions.length > 0}
              actions={actions}
              pagination={{
                pageIndex: filters.page - 1,
                pageSize: filters.limit,
              }}
              setPagination={({ pageIndex }) =>
                setFilters({ page: pageIndex + 1 })
              }
              pageCount={meta?.totalPages ?? 1}
              totalItems={meta?.total}
              hasNextPage={filters.page < (meta?.totalPages ?? 1)}
              hasPrevPage={filters.page > 1}
            />
          </Box>
        </Box>
      </Stack>

      <TransferModal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        kind={modal?.kind}
        transfer={modal?.transfer}
        accountId={filters.accountId || undefined}
      />

      <ConsentDialog
        open={Boolean(pendingDelete)}
        onOpenChange={({ open }) => {
          if (!open) setPendingDelete(null);
        }}
        heading="Delete this transfer?"
        note="It will be taken off both accounts."
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
