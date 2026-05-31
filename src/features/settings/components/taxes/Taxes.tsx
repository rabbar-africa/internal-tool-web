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
import { ScalesIcon } from "@/assets/custom/ScalesIcon";
import { ActionButton } from "@/components/common/ActionButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { SettingsSubPage } from "../SettingsSubPage";
import { TaxModal } from "./TaxModal";
import {
  useDeleteOrganizationTax,
  useGetOrganizationTaxes,
  useUpdateOrganizationTax,
} from "../../api";
import type { IOrgTax } from "@/shared/interface/settings";

export function Taxes() {
  const { data, isLoading } = useGetOrganizationTaxes();
  const taxes = data?.data ?? [];
  const { mutate: updateTax, isPending: isUpdating } =
    useUpdateOrganizationTax();
  const { mutate: deleteTax, isPending: isDeleting } =
    useDeleteOrganizationTax();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IOrgTax | null>(null);
  const [deleting, setDeleting] = useState<IOrgTax | null>(null);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteTax(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (tax: IOrgTax) => {
    setEditing(tax);
    setModalOpen(true);
  };

  const makeDefault = (tax: IOrgTax) =>
    updateTax({ id: tax.id, payload: { isDefault: true } });

  return (
    <SettingsSubPage
      title="Taxes"
      subtitle="Set up VAT, withholding, and other tax rates used on transactions."
      action={
        <ActionButton
          icon={PlusIcon}
          text="Add Tax"
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
      ) : taxes.length === 0 ? (
        <Center py="12" flexDirection="column" gap="3">
          <Flex
            align="center"
            justify="center"
            boxSize="12"
            rounded="full"
            bg="gray.50"
            color="gray.300"
          >
            <ScalesIcon boxSize="1.5rem" />
          </Flex>
          <Text fontSize="14px" color="gray.400" fontWeight="500">
            No taxes configured
          </Text>
          <ActionButton
            icon={PlusIcon}
            text="Add Tax"
            size="sm"
            variant="outline"
            onClick={openCreate}
            iconProps={{ boxSize: "1rem" }}
            mt="1"
          />
        </Center>
      ) : (
        <Stack gap="3">
          {taxes.map((tax) => (
            <Flex
              key={tax.id}
              align="center"
              justify="space-between"
              gap="3"
              p="4"
              borderWidth="1px"
              borderColor={tax.isDefault ? "primary.100" : "gray.75"}
              bg={tax.isDefault ? "primary.50" : "white"}
              rounded="lg"
            >
              <Box minW="0">
                <Flex align="center" gap="2" flexWrap="wrap">
                  <Text fontSize="14px" fontWeight="600" color="gray.500">
                    {tax.name}
                  </Text>
                  <Text fontSize="13px" color="gray.400" fontWeight="600">
                    {tax.rate}%
                  </Text>
                  {tax.isDefault && (
                    <Badge size="sm" variant="solid" colorPalette="blue">
                      Default
                    </Badge>
                  )}
                  {tax.isCompound && (
                    <Badge size="sm" variant="subtle" colorPalette="purple">
                      Compound
                    </Badge>
                  )}
                  {!tax.isActive && (
                    <Badge size="sm" variant="subtle" colorPalette="gray">
                      Inactive
                    </Badge>
                  )}
                </Flex>
              </Box>
              <Flex gap="1" flexShrink={0}>
                {!tax.isDefault && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="primary.300"
                    loading={isUpdating}
                    onClick={() => makeDefault(tax)}
                  >
                    Make default
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  onClick={() => openEdit(tax)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  color="error.300"
                  onClick={() => setDeleting(tax)}
                >
                  Remove
                </Button>
              </Flex>
            </Flex>
          ))}
        </Stack>
      )}

      <TaxModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tax={editing}
      />

      <ConsentDialog
        open={!!deleting}
        onOpenChange={({ open }) => {
          if (!open) setDeleting(null);
        }}
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
        heading="Delete this tax?"
        note={
          deleting
            ? `"${deleting.name} (${deleting.rate}%)" will be permanently removed. This action cannot be undone.`
            : undefined
        }
      />
    </SettingsSubPage>
  );
}
