import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Badge,
  Box,
  Center,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PlusIcon } from "@/assets/custom/PlusIcon";
import { BooksIcon } from "@/assets/custom/BooksIcon";
import { ActionButton } from "@/components/common/ActionButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { ActionMenu, type TableAction } from "@/components/table/ActionMenu";
import { SettingsSubPage } from "../SettingsSubPage";
import { BankAccountModal } from "./BankAccountModal";
import {
  useDeleteOrganizationBankAccount,
  useGetOrganizationBankAccounts,
  useSetPrimaryOrganizationBankAccount,
} from "../../api";
import type { IOrgBankAccount } from "@/shared/interface/settings";
import { formatCurrency } from "@/utils/calculations";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import {
  TransferModal,
  type TransferKind,
} from "@/features/banking/components/TransferModal";

/** "Opening balance on 01 Oct 2026: ₦50,000", or nothing when none is set. */
function OpeningBalanceLine({ account }: { account: IOrgBankAccount }) {
  const amount = Number(account.openingBalance ?? 0) || 0;
  if (!amount && !account.openingBalanceDate) return null;
  const on = account.openingBalanceDate
    ? `on ${moment(account.openingBalanceDate.slice(0, 10)).format("DD MMM YYYY")}`
    : "from the start";
  return (
    <Text fontSize="12px" color="gray.300" mt="2">
      Opening balance {on}: {formatCurrency(amount)}
    </Text>
  );
}

/** One account: what it is at a glance, everything you can do in its menu. */
function AccountCard({
  account,
  actions,
}: {
  account: IOrgBankAccount;
  actions: TableAction<IOrgBankAccount>[];
}) {
  const isCash = account.type === "CASH";
  return (
    <Box
      borderWidth="1px"
      borderColor={account.isPrimary ? "primary.100" : "gray.75"}
      bg="white"
      rounded="lg"
      p="4"
    >
      <Flex align="flex-start" gap="2">
        <Box flex="1" minW={0}>
          <Flex align="center" gap="2" flexWrap="wrap">
            <Text fontSize="14px" fontWeight="600" color="gray.500">
              {isCash ? "Cash on hand" : account.bankName}
            </Text>
            {account.isPrimary && (
              <Badge size="sm" variant="subtle" colorPalette="blue">
                Primary
              </Badge>
            )}
            {isCash && (
              <Badge size="sm" variant="subtle">
                Cash
              </Badge>
            )}
          </Flex>
          <Text fontSize="13px" color="gray.400" mt="1" lineClamp={1}>
            {isCash
              ? account.accountName
              : `${account.accountName} · ${account.accountNumber}`}
          </Text>
        </Box>
        <Box mt="-1" mr="-2">
          <ActionMenu row={{ original: account }} actions={actions} />
        </Box>
      </Flex>
      <OpeningBalanceLine account={account} />
    </Box>
  );
}

export function AccountDetails() {
  const navigate = useNavigate();
  const { canRead, canCreate } = usePermissions();

  // The Cash account (the till) only comes back with includeCash; it's listed
  // after the banks with the same card, minus what a till can't do.
  const { data, isLoading } = useGetOrganizationBankAccounts({
    includeCash: true,
  });
  const { bankAccounts, allAccounts } = useMemo(() => {
    const all = data?.data ?? [];
    const banks = all.filter((account) => account.type !== "CASH");
    const cash = all.filter((account) => account.type === "CASH");
    return { bankAccounts: banks, allAccounts: [...banks, ...cash] };
  }, [data?.data]);

  const { mutate: setPrimary } = useSetPrimaryOrganizationBankAccount();
  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteOrganizationBankAccount();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IOrgBankAccount | null>(null);
  const [deleting, setDeleting] = useState<IOrgBankAccount | null>(null);
  const [transfer, setTransfer] = useState<{
    kind: TransferKind;
    accountId: string;
  } | null>(null);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteAccount(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (account: IOrgBankAccount) => {
    setEditing(account);
    setModalOpen(true);
  };

  const isCash = (account: IOrgBankAccount) => account.type === "CASH";
  const actions: TableAction<IOrgBankAccount>[] = [
    {
      label: "View statement",
      value: "statement",
      onClick: (account) =>
        navigate(RouteConstants.banking.statement.generate({ id: account.id })),
      hidden: () => !canRead("banking"),
    },
    {
      label: "View payments",
      value: "payments",
      onClick: (account) =>
        navigate(
          `${RouteConstants.payments.base.path}?depositToAccountId=${encodeURIComponent(account.id)}`,
        ),
      hidden: () => !canRead("payments_received"),
    },
    {
      label: "View expenses",
      value: "expenses",
      onClick: (account) =>
        navigate(
          `${RouteConstants.expenses.base.path}?paidThroughAccountId=${encodeURIComponent(account.id)}`,
        ),
      hidden: () => !canRead("expenses"),
    },
    {
      label: "Deposit cash to bank",
      value: "deposit",
      separator: true,
      onClick: (account) =>
        setTransfer({ kind: "deposit", accountId: account.id }),
      hidden: (account) => !isCash(account) || !canCreate("banking"),
    },
    {
      label: "Withdraw cash",
      value: "withdraw",
      separator: true,
      onClick: (account) =>
        setTransfer({ kind: "withdraw", accountId: account.id }),
      hidden: (account) => isCash(account) || !canCreate("banking"),
    },
    {
      label: "Set as primary",
      value: "primary",
      separator: true,
      onClick: (account) => setPrimary(account.id),
      hidden: (account) => isCash(account) || account.isPrimary,
    },
    {
      label: "Edit",
      value: "edit",
      onClick: openEdit,
    },
    {
      label: "Remove",
      value: "remove",
      variant: "destructive",
      onClick: (account) => setDeleting(account),
      // The till is never deleted; the API refuses it anyway.
      hidden: isCash,
    },
  ];

  return (
    <SettingsSubPage
      title="Account Details"
      subtitle="Bank accounts shown on invoices and used to receive payments."
      action={
        <ActionButton
          icon={PlusIcon}
          text="Add Account"
          size="sm"
          onClick={openCreate}
          iconProps={{ boxSize: "1rem" }}
        />
      }
    >
      {isLoading ? (
        <Center py="12">
          <Spinner color="primary.300" />
        </Center>
      ) : (
        <Stack gap="4">
          {bankAccounts.length === 0 && (
            <Center py="8" flexDirection="column" gap="3">
              <Flex
                align="center"
                justify="center"
                boxSize="12"
                rounded="full"
                bg="gray.50"
                color="gray.300"
              >
                <BooksIcon boxSize="1.5rem" />
              </Flex>
              <Text fontSize="14px" color="gray.400" fontWeight="500">
                No bank accounts yet
              </Text>
              <Text fontSize="12px" color="gray.300">
                Add an account to display on your invoices.
              </Text>
            </Center>
          )}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="4">
            {allAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                actions={actions}
              />
            ))}
          </Grid>
        </Stack>
      )}

      <TransferModal
        open={Boolean(transfer)}
        onClose={() => setTransfer(null)}
        kind={transfer?.kind}
        accountId={transfer?.accountId}
      />

      <BankAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        account={editing}
      />

      <ConsentDialog
        open={!!deleting}
        onOpenChange={({ open }) => {
          if (!open) setDeleting(null);
        }}
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
        heading="Delete this bank account?"
        note={
          deleting
            ? `"${deleting.bankName} — ${deleting.accountNumber}" will be permanently removed. This action cannot be undone.`
            : undefined
        }
      />
    </SettingsSubPage>
  );
}
