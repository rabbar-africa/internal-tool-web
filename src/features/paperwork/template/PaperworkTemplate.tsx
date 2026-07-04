import { useMemo, useState } from "react";
import { Box, Button, Flex, Stack } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { SearchInput } from "@/components/input/SearchInput";
import { CustomTable, type TableAction } from "@/components/table";
import { PageHeader } from "@/components/common/PageHeader";
import { useUrlState } from "@/hooks/useUrlState";
import type { IPaperwork } from "@/shared/interface/paperwork";
import {
  useDeletePaperworkMutation,
  useGetPaperworkListQuery,
} from "../api/query";
import { DOCUMENT_TYPE_OPTIONS } from "../utils/paperwork";
import { paperworkColumns } from "../components/columns";
import { PaperworkFormModal } from "../components/PaperworkFormModal";
import { RenewPaperworkModal } from "../components/RenewPaperworkModal";
import { PaperworkDetailModal } from "../components/PaperworkDetailModal";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";

const STATUS_OPTIONS = [
  { label: "Valid", value: "VALID" },
  { label: "Expiring soon", value: "EXPIRING_SOON" },
  { label: "Expired", value: "EXPIRED" },
  { label: "No expiry", value: "NO_EXPIRY" },
];

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  status: { defaultValue: "" },
  documentType: { defaultValue: "" },
};

export function PaperworkTemplate() {
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IPaperwork | null>(null);
  const [renewTarget, setRenewTarget] = useState<IPaperwork | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IPaperwork | null>(null);

  const { data, isLoading } = useGetPaperworkListQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.documentType ? { documentType: filters.documentType } : {}),
  });

  const { mutateAsync: deletePaperwork, isPending: deleting } =
    useDeletePaperworkMutation();

  const documents = data?.data ?? [];
  const meta = data?.meta;

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (doc: IPaperwork) => {
    setDetailId(null);
    setEditTarget(doc);
    setFormOpen(true);
  };

  const openRenew = (doc: IPaperwork) => {
    setDetailId(null);
    setRenewTarget(doc);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePaperwork(deleteTarget.id);
    setDeleteTarget(null);
  };

  const tableActions = useMemo<TableAction<IPaperwork>[]>(
    () => [
      { label: "View", value: "view", onClick: (d) => setDetailId(d.id) },
      { label: "Renew", value: "renew", onClick: openRenew },
      { label: "Edit", value: "edit", onClick: openEdit },
      { label: "Delete", value: "delete", onClick: (d) => setDeleteTarget(d) },
    ],
    [],
  );

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Paperwork"
          subtitle="Track document expiries and keep digital copies in one place"
          action={<Button onClick={openCreate}>Add Document</Button>}
        />

        <Box
          pt="2rem"
          pb="2rem"
          bg="white"
          px="1rem"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Flex
            justifyContent="flex-start"
            alignItems="center"
            mb="1.5rem"
            gap="3"
            direction={{ base: "column", md: "row" }}
          >
            <CustomSelect
              placeholder="All Status"
              options={STATUS_OPTIONS}
              value={filters.status ? [filters.status] : undefined}
              onChange={(opt: { value: string[] }) =>
                setFilters({ status: opt?.value?.[0] ?? "", page: 1 })
              }
              rootProps={{ size: "sm" }}
              controlProps={{ w: "160px" }}
            />

            <CustomSelect
              placeholder="All Types"
              options={DOCUMENT_TYPE_OPTIONS}
              value={filters.documentType ? [filters.documentType] : undefined}
              onChange={(opt: { value: string[] }) =>
                setFilters({ documentType: opt?.value?.[0] ?? "", page: 1 })
              }
              rootProps={{ size: "sm" }}
              controlProps={{ w: "190px" }}
            />

            <SearchInput
              placeholder="Search issuer or reference"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val) => setFilters({ search: val, page: 1 })}
              debounceMs={500}
              loading={isLoading}
              width={{ base: "100%", md: "21rem" }}
            />
          </Flex>

          <Box overflowX="auto" minW={0}>
            <CustomTable
              data={documents}
              columns={paperworkColumns}
              loading={isLoading}
              enableActions
              actions={tableActions}
              onRowClick={(row) => setDetailId(row.original.id)}
              NoDataText="No documents yet. Add one to start tracking expiries."
              tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
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

      {formOpen && (
        <PaperworkFormModal
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
          }}
          paperwork={editTarget}
        />
      )}

      {renewTarget && (
        <RenewPaperworkModal
          open={Boolean(renewTarget)}
          onClose={() => setRenewTarget(null)}
          paperwork={renewTarget}
        />
      )}

      {detailId && (
        <PaperworkDetailModal
          open={Boolean(detailId)}
          onClose={() => setDetailId(null)}
          paperworkId={detailId}
          onEdit={openEdit}
          onRenew={openRenew}
        />
      )}

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
