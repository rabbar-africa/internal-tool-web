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
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@/assets/custom/PlusIcon";
import { BooksIcon } from "@/assets/custom/BooksIcon";
import { ActionButton } from "@/components/common/ActionButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { RouteConstants } from "@/shared/constants/routes";
import type { IOrgTemplate } from "@/shared/interface/settings";
import { SettingsSubPage } from "../SettingsSubPage";
import {
  useDeleteOrganizationTemplate,
  useGetOrganizationTemplates,
  useUpdateOrganizationTemplate,
} from "../../api";
import { LAYOUT_DETAILS } from "./layoutDetails";

const { settings } = RouteConstants;

export function InvoiceTemplates() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetOrganizationTemplates();
  const { usageOf } = usePlanAccess();
  const { mutate: updateTemplate, isPending: isUpdating } =
    useUpdateOrganizationTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } =
    useDeleteOrganizationTemplate();
  const [deleting, setDeleting] = useState<IOrgTemplate | null>(null);

  const templates = (data?.data ?? []).filter(
    (template) => template.module === "INVOICE",
  );
  // The allowance is per document type, so compare against invoices only.
  const limit = usageOf("templates")?.limit ?? null;
  const isAtLimit = limit !== null && templates.length >= limit;
  const hasDefault = templates.some((template) => template.isDefault);

  const openCreate = () => navigate(settings.createInvoiceTemplate.path);
  const openEdit = (template: IOrgTemplate) =>
    navigate(settings.editInvoiceTemplate.generate({ id: template.id }));

  const confirmDelete = () => {
    if (!deleting) return;
    deleteTemplate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <SettingsSubPage
      title="Invoice Templates"
      subtitle="Design how your invoices look. The default is used unless an invoice picks another."
      action={
        <ActionButton
          icon={PlusIcon}
          text="New Template"
          size="sm"
          onClick={openCreate}
          disabled={isAtLimit}
          iconProps={{ boxSize: "1rem" }}
        />
      }
    >
      {isAtLimit ? (
        <Text fontSize="13px" color="gray.400" mb="4">
          Your plan includes {limit} invoice templates. Delete one or upgrade to
          add another.
        </Text>
      ) : null}

      {isLoading ? (
        <Center py="12">
          <Spinner color="primary.300" />
        </Center>
      ) : templates.length === 0 ? (
        <Center py="12" flexDirection="column" gap="3" textAlign="center">
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
            Your invoices use the standard design
          </Text>
          <Text fontSize="13px" color="gray.300" maxW="360px">
            Create a template to choose a layout, your colours, and what appears
            on your invoices.
          </Text>
          <ActionButton
            icon={PlusIcon}
            text="New Template"
            size="sm"
            variant="outline"
            onClick={openCreate}
            iconProps={{ boxSize: "1rem" }}
            mt="1"
          />
        </Center>
      ) : (
        <Stack gap="3">
          {!hasDefault ? (
            <Text fontSize="13px" color="gray.400">
              No default set, so invoices use the standard design unless they
              pick a template.
            </Text>
          ) : null}
          {templates.map((template) => (
            <Flex
              key={template.id}
              align={{ base: "flex-start", sm: "center" }}
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              gap="3"
              p="4"
              borderWidth="1px"
              borderColor={template.isDefault ? "primary.100" : "gray.75"}
              bg={template.isDefault ? "primary.50" : "white"}
              rounded="lg"
            >
              <Flex align="center" gap="3" minW="0">
                <Flex flexShrink={0} rounded="md" overflow="hidden">
                  <Box boxSize="6" bg={template.design.style.headerColor} />
                  <Box boxSize="6" bg={template.design.style.primaryColor} />
                </Flex>
                <Box minW="0">
                  <Flex align="center" gap="2" flexWrap="wrap">
                    <Text fontSize="14px" fontWeight="600" color="gray.500">
                      {template.name}
                    </Text>
                    {template.isDefault ? (
                      <Badge size="sm" variant="solid" colorPalette="blue">
                        Default
                      </Badge>
                    ) : null}
                  </Flex>
                  <Text fontSize="12px" color="gray.400">
                    {LAYOUT_DETAILS[template.design.layout].label} layout
                  </Text>
                </Box>
              </Flex>
              <Flex gap="1" flexShrink={0} flexWrap="wrap">
                {!template.isDefault ? (
                  <Button
                    size="xs"
                    variant="ghost"
                    loading={isUpdating}
                    onClick={() =>
                      updateTemplate({
                        id: template.id,
                        payload: { isDefault: true },
                      })
                    }
                  >
                    Make default
                  </Button>
                ) : null}
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => openEdit(template)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  color="error.300"
                  onClick={() => setDeleting(template)}
                >
                  Delete
                </Button>
              </Flex>
            </Flex>
          ))}
        </Stack>
      )}

      <ConsentDialog
        open={Boolean(deleting)}
        onOpenChange={({ open }) => {
          if (!open) setDeleting(null);
        }}
        variant="warning"
        heading={`Delete ${deleting?.name ?? "this template"}?`}
        note="Invoices using it will switch to your default design. Their numbers and details won't change."
        confirmText="Yes, delete"
        cancelText="Keep it"
        isLoading={isDeleting}
        handleSubmit={confirmDelete}
      />
    </SettingsSubPage>
  );
}
