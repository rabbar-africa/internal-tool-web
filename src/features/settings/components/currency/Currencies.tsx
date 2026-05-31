import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PlusIcon } from "@/assets/custom/PlusIcon";
import { Money } from "@/assets/custom/Money";
import { ActionButton } from "@/components/common/ActionButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { SettingsSubPage } from "../SettingsSubPage";
import { CurrencyModal } from "./CurrencyModal";
import {
  useDeleteOrganizationCurrency,
  useGetOrganizationCurrencies,
  useSetDefaultOrganizationCurrency,
} from "../../api";
import type { IOrgCurrency } from "@/shared/interface/settings";

export function Currencies() {
  const { data, isLoading } = useGetOrganizationCurrencies();
  const currencies = data?.data ?? [];
  const { mutate: setDefault, isPending: isSettingDefault } =
    useSetDefaultOrganizationCurrency();
  const { mutate: deleteCurrency, isPending: isDeleting } =
    useDeleteOrganizationCurrency();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IOrgCurrency | null>(null);
  const [deleting, setDeleting] = useState<IOrgCurrency | null>(null);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteCurrency(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (currency: IOrgCurrency) => {
    setEditing(currency);
    setModalOpen(true);
  };

  return (
    <SettingsSubPage
      title="Currencies"
      subtitle="Configure the currencies your organization transacts in."
      action={
        <ActionButton
          icon={PlusIcon}
          text="Add Currency"
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
      ) : currencies.length === 0 ? (
        <Center py="12" flexDirection="column" gap="3">
          <Flex
            align="center"
            justify="center"
            boxSize="12"
            rounded="full"
            bg="gray.50"
            color="gray.300"
          >
            <Money boxSize="1.5rem" />
          </Flex>
          <Text fontSize="14px" color="gray.400" fontWeight="500">
            No currencies configured
          </Text>
          <ActionButton
            icon={PlusIcon}
            text="Add Currency"
            size="sm"
            variant="outline"
            onClick={openCreate}
            iconProps={{ boxSize: "1rem" }}
            mt="1"
          />
        </Center>
      ) : (
        <Stack gap="3">
          {currencies.map((currency) => (
            <Flex
              key={currency.id}
              align="center"
              justify="space-between"
              gap="3"
              p="4"
              borderWidth="1px"
              borderColor={currency.isDefault ? "primary.100" : "gray.75"}
              bg={currency.isDefault ? "primary.50" : "white"}
              rounded="lg"
            >
              <Flex align="center" gap="3" minW="0">
                <Flex
                  align="center"
                  justify="center"
                  boxSize="10"
                  rounded="md"
                  bg="gray.50"
                  color="gray.500"
                  fontWeight="600"
                  fontSize="14px"
                  flexShrink={0}
                >
                  {currency.symbol || currency.code.slice(0, 1)}
                </Flex>
                <Box minW="0">
                  <Flex align="center" gap="2" flexWrap="wrap">
                    <Text fontSize="14px" fontWeight="600" color="gray.500">
                      {currency.code}
                    </Text>
                    {currency.isDefault && (
                      <Badge size="sm" variant="solid" colorPalette="blue">
                        Default
                      </Badge>
                    )}
                    {!currency.isActive && (
                      <Badge size="sm" variant="subtle" colorPalette="gray">
                        Inactive
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="12px" color="gray.300">
                    {currency.name || "—"} · Rate {currency.exchangeRate}
                  </Text>
                </Box>
              </Flex>
              <Flex gap="1" flexShrink={0}>
                {!currency.isDefault && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="primary.300"
                    loading={isSettingDefault}
                    onClick={() => setDefault(currency.id)}
                  >
                    Make default
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  onClick={() => openEdit(currency)}
                >
                  Edit
                </Button>
                {!currency.isDefault && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="error.300"
                    onClick={() => setDeleting(currency)}
                  >
                    Remove
                  </Button>
                )}
              </Flex>
            </Flex>
          ))}
        </Stack>
      )}

      <CurrencyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currency={editing}
      />

      <ConsentDialog
        open={!!deleting}
        onOpenChange={({ open }) => {
          if (!open) setDeleting(null);
        }}
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
        heading="Delete this currency?"
        note={
          deleting
            ? `"${deleting.code}" will be permanently removed. This action cannot be undone.`
            : undefined
        }
      />
    </SettingsSubPage>
  );
}
