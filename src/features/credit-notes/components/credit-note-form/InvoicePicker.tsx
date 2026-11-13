import { useMemo, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { useGetAllInvoicesQuery } from "@/features/invoices/api/query";
import type { IInvoiceResponse } from "@/shared/interface/invoice";
import { isCreditableInvoiceStatus } from "../../utils/credit-note-status";

/**
 * What the list endpoint really sends. The shared `Invoice` type it's declared
 * with is an older shape (totalAmount, amountDue), which the invoice list
 * screen sidesteps the same way.
 */
type InvoiceRow = Pick<
  IInvoiceResponse,
  "id" | "invoiceNumber" | "customerName" | "status" | "total" | "balance"
>;

/** A credit note is always made from one invoice: pick it first. */
export function InvoicePicker({
  onPick,
}: {
  onPick: (invoiceId: string) => void;
}) {
  const { formatMoney } = useFormatMoney();
  const [search, setSearch] = useState("");
  const { data, isFetching } = useGetAllInvoicesQuery({
    limit: 20,
    ...(search ? { search } : {}),
  });

  const options = useMemo(
    () =>
      ((data?.data ?? []) as unknown as InvoiceRow[])
        .filter((invoice) => isCreditableInvoiceStatus(invoice.status))
        .map((invoice) => ({
          value: invoice.id,
          label: `${invoice.invoiceNumber} · ${invoice.customerName ?? "—"}`,
          subLabel: `${formatMoney(invoice.total)} · owes ${formatMoney(invoice.balance)}`,
        })),
    [data?.data, formatMoney],
  );

  return (
    <Box
      bg="white"
      rounded=".625rem"
      borderWidth="1px"
      borderColor="gray.75"
      shadow="xs"
      p={{ base: "4", md: "6" }}
      maxW="36rem"
    >
      <Text fontSize="15px" fontWeight="700" color="gray.500">
        Which invoice are you crediting?
      </Text>
      <Text fontSize="12px" color="gray.300" mb="4">
        Only issued invoices can be credited. Drafts, voided and written-off
        invoices aren't listed.
      </Text>
      <SearchCombobox
        label="Invoice"
        placeholder="Search by invoice # or customer"
        options={options}
        onChange={(value) => value && onPick(value)}
        onSearchChange={setSearch}
        serverSearch
        isLoading={isFetching}
        emptyText="No invoices to credit"
      />
    </Box>
  );
}
