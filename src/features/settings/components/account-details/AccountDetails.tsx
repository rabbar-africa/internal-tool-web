import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { PlusIcon } from "@/assets/custom/PlusIcon";
import { BooksIcon } from "@/assets/custom/BooksIcon";
import { ActionButton } from "@/components/common/ActionButton";
import ConsentDialog from "@/components/common/ConsentDialog";
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

/**
 * Where this account's money is: its payments, expenses and transfers (each
 * list filtered to it), plus banking or withdrawing cash from here.
 */
function AccountMoneyLinks({
  account,
  onTransfer,
}: {
  account: IOrgBankAccount;
  onTransfer: (kind: TransferKind, accountId: string) => void;
}) {
  const navigate = useNavigate();
  const { canRead, canCreate } = usePermissions();
  const isCash = account.type === "CASH";
  const id = encodeURIComponent(account.id);

  const links = [
    canRead("payments_received") && {
      label: "Payments",
      to: `${RouteConstants.payments.base.path}?depositToAccountId=${id}`,
    },
    canRead("expenses") && {
      label: "Expenses",
      to: `${RouteConstants.expenses.base.path}?paidThroughAccountId=${id}`,
    },
    canRead("banking") && {
      label: "Transfers",
      to: `${RouteConstants.banking.transfers.path}?accountId=${id}`,
    },
  ].filter(Boolean) as { label: string; to: string }[];

  if (!links.length && !canCreate("banking")) return null;

  return (
    <Flex align="center" gap="3" mt="3" flexWrap="wrap">
      {links.map((link) => (
        <Button
          key={link.label}
          size="xs"
          variant="ghost"
          px="1"
          color="primary.300"
          onClick={() => navigate(link.to)}
        >
          {link.label}
        </Button>
      ))}
      {canCreate("banking") && (
        <Button
          size="xs"
          variant="outline"
          ml="auto"
          onClick={() =>
            onTransfer(isCash ? "deposit" : "withdraw", account.id)
          }
        >
          {isCash ? "Deposit to bank" : "Withdraw cash"}
        </Button>
      )}
    </Flex>
  );
}

/** "Balance on 01 Oct 2026: ₦50,000.00", or nothing when none is set. */
function OpeningBalanceLine({ account }: { account: IOrgBankAccount }) {
  const amount = Number(account.openingBalance ?? 0) || 0;
  if (!amount && !account.openingBalanceDate) return null;
  const on = account.openingBalanceDate
    ? `on ${moment(account.openingBalanceDate.slice(0, 10)).format("DD MMM YYYY")}`
    : "from the start";
  return (
    <Text fontSize="12px" color="gray.300" mt="1">
      Opening balance {on}: {formatCurrency(amount)}
    </Text>
  );
}

export function AccountDetails() {
  // The settings list is bank accounts; the Cash account (the till) only comes
  // back with includeCash, and gets its own card.
  const { data, isLoading } = useGetOrganizationBankAccounts({
    includeCash: true,
  });
  const { accounts, cashAccount } = useMemo(() => {
    const all = data?.data ?? [];
    return {
      accounts: all.filter((account) => account.type !== "CASH"),
      cashAccount: all.find((account) => account.type === "CASH") ?? null,
    };
  }, [data?.data]);
  const { mutate: setPrimary, isPending: isSettingPrimary } =
    useSetPrimaryOrganizationBankAccount();
  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteOrganizationBankAccount();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IOrgBankAccount | null>(null);
  const [deleting, setDeleting] = useState<IOrgBankAccount | null>(null);
  const [transfer, setTransfer] = useState<{
    kind: TransferKind;
    accountId: string;
  } | null>(null);
  const openTransfer = (kind: TransferKind, accountId: string) =>
    setTransfer({ kind, accountId });

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
      ) : accounts.length === 0 ? (
        <Center py="12" flexDirection="column" gap="3">
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
          <ActionButton
            icon={PlusIcon}
            text="Add Account"
            size="sm"
            variant="outline"
            onClick={openCreate}
            iconProps={{ boxSize: "1rem" }}
            mt="1"
          />
        </Center>
      ) : (
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="4">
          {accounts.map((account) => (
            <Box
              key={account.id}
              borderWidth="1px"
              borderColor={account.isPrimary ? "primary.100" : "gray.75"}
              bg={account.isPrimary ? "primary.50" : "white"}
              rounded="lg"
              p="4"
            >
              <Flex align="center" gap="2" flexWrap="wrap" mb="2">
                <Text fontSize="14px" fontWeight="600" color="gray.500">
                  {account.bankName}
                </Text>
                {account.isPrimary && (
                  <Badge size="sm" variant="solid" colorPalette="blue">
                    Primary
                  </Badge>
                )}
              </Flex>
              <Text fontSize="13px" color="gray.400">
                {account.accountName}
              </Text>
              <Text
                fontSize="14px"
                color="gray.500"
                fontWeight="500"
                letterSpacing="0.5px"
              >
                {account.accountNumber}
              </Text>
              <OpeningBalanceLine account={account} />
              <AccountMoneyLinks account={account} onTransfer={openTransfer} />
              <Flex
                gap="2"
                mt="3"
                pt="3"
                borderTopWidth="1px"
                borderColor="gray.75"
              >
                {!account.isPrimary && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="primary.300"
                    loading={isSettingPrimary}
                    onClick={() => setPrimary(account.id)}
                  >
                    Set as primary
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  onClick={() => openEdit(account)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  color="error.300"
                  onClick={() => setDeleting(account)}
                  ml="auto"
                >
                  Remove
                </Button>
              </Flex>
            </Box>
          ))}
        </Grid>
      )}

      {cashAccount && (
        <Box
          borderWidth="1px"
          borderColor="gray.75"
          rounded="lg"
          p="4"
          mt="4"
          maxW={{ lg: "calc(50% - 0.5rem)" }}
        >
          <Flex align="center" gap="2" flexWrap="wrap" mb="2">
            <Text fontSize="14px" fontWeight="600" color="gray.500">
              Cash on hand
            </Text>
            <Badge size="sm" variant="subtle">
              Cash
            </Badge>
          </Flex>
          <Text fontSize="13px" color="gray.400">
            {cashAccount.accountName}
          </Text>
          <Text fontSize="12px" color="gray.300">
            Money in the till: cash payments land here, cash expenses leave from
            here.
          </Text>
          <OpeningBalanceLine account={cashAccount} />
          <AccountMoneyLinks account={cashAccount} onTransfer={openTransfer} />
          <Flex
            gap="2"
            mt="3"
            pt="3"
            borderTopWidth="1px"
            borderColor="gray.75"
          >
            <Button
              size="xs"
              variant="ghost"
              color="gray.400"
              onClick={() => openEdit(cashAccount)}
            >
              Edit
            </Button>
          </Flex>
        </Box>
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
