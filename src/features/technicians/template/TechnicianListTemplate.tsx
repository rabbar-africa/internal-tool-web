import { useMemo, useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { CustomTable, type TableAction } from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { PageHeader } from "@/components/common/PageHeader";
import ConsentDialog from "@/components/common/ConsentDialog";
import { useUrlState } from "@/hooks/useUrlState";
import {
  technicianFullName,
  type Technician,
} from "@/shared/interface/technician";
import {
  useDeleteTechnicianMutation,
  useGetTechniciansQuery,
} from "../api/query";
import { TechnicianFormModal } from "../components/TechnicianFormModal";

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  isActive: { defaultValue: "" },
};

const ACTIVE_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const columns: ColumnDef<Technician>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {technicianFullName(row.original)}
      </Text>
    ),
  },
  {
    accessorKey: "specialty",
    header: "Specialty",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean;
      return (
        <Box
          display="inline-flex"
          bg={isActive ? "green.50" : "gray.100"}
          px="10px"
          py="4px"
          rounded="md"
          alignItems="center"
        >
          <Text
            fontSize="12px"
            fontWeight="500"
            color={isActive ? "green.600" : "gray.500"}
          >
            {isActive ? "Active" : "Inactive"}
          </Text>
        </Box>
      );
    },
  },
];

export function TechnicianListTemplate() {
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Technician | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Technician | null>(null);

  const { data, isLoading, isFetching } = useGetTechniciansQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.isActive ? { isActive: filters.isActive } : {}),
  });

  const { mutateAsync: deleteTechnician, isPending: isDeleting } =
    useDeleteTechnicianMutation();

  const technicians = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;

  const tableActions: TableAction<Technician>[] = [
    {
      label: "Edit",
      value: "edit",
      onClick: (technician) => {
        setEditing(technician);
        setFormOpen(true);
      },
    },
    {
      label: "Delete",
      value: "delete",
      variant: "destructive",
      separator: true,
      onClick: (technician) => setPendingDelete(technician),
    },
  ];

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteTechnician(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Technicians"
          subtitle="Workshop staff assigned to job cards"
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add Technician
            </Button>
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
            <CustomSelect
              placeholder="All Statuses"
              options={ACTIVE_OPTIONS}
              value={filters.isActive ? [filters.isActive] : undefined}
              onChange={(opt: { value: string[] }) =>
                setFilters({ isActive: opt?.value?.[0] ?? "", page: 1 })
              }
              rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
              controlProps={{ w: { base: "100%", md: "150px" } }}
            />
            <SearchInput
              placeholder="Search by name, phone or specialty"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val: string) => setFilters({ search: val, page: 1 })}
              debounceMs={500}
              loading={isFetching}
              width={{ base: "100%", md: "21rem" }}
            />
          </Flex>

          <Box overflowX="auto" minW={0}>
            <CustomTable
              data={technicians}
              columns={columns}
              loading={isLoading}
              enableActions
              actions={tableActions}
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

      <TechnicianFormModal
        open={formOpen}
        onClose={handleCloseForm}
        technician={editing}
      />

      <ConsentDialog
        open={Boolean(pendingDelete)}
        onOpenChange={({ open }) => {
          if (!open) setPendingDelete(null);
        }}
        heading="Delete technician?"
        note={
          pendingDelete
            ? `${technicianFullName(pendingDelete)} will be removed permanently. Job cards they worked on are not affected.`
            : undefined
        }
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
