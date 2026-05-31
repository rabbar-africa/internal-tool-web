import { useState } from "react";
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

export function AccountDetails() {
  const { data, isLoading } = useGetOrganizationBankAccounts();
  const accounts = data?.data ?? [];
  const { mutate: setPrimary, isPending: isSettingPrimary } =
    useSetPrimaryOrganizationBankAccount();
  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteOrganizationBankAccount();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IOrgBankAccount | null>(null);
  const [deleting, setDeleting] = useState<IOrgBankAccount | null>(null);

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
              {account.bankCode && (
                <Text fontSize="12px" color="gray.300" mt="1">
                  Code: {account.bankCode}
                </Text>
              )}
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
