import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { useCreateCustomerMutation } from "@/features/customers/api/query";
import type { CreateCustomerPayload } from "@/shared/interface/customer";
import { removeFalsyAndEmptyArrayFields } from "@/utils/object-formatter";
import {
  CustomerForm,
  DEFAULT_CUSTOMER_FORM_VALUES,
  type CustomerFormValues,
} from "@/features/customers/components/customer-form/CustomerForm";

export function CreateCustomerTemplate() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCustomerMutation();

  const handleSubmit = async (values: CustomerFormValues) => {
    await mutateAsync(
      removeFalsyAndEmptyArrayFields({
        displayName: values.displayName,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        type: values.type,
        stage: values.stage,
        address: values.address || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        country: values.country,
      }) as CreateCustomerPayload,
    );
    navigate(RouteConstants.customers.base.path);
  };

  return (
    <Stack gap="6">
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
      >
        <Box>
          <Text textStyle="h3-bold" color="gray.500">
            Add Customer
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Add a new customer to your database
          </Text>
        </Box>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(RouteConstants.customers.base.path)}
        >
          Cancel
        </Button>
      </Flex>

      <CustomerForm
        mode="create"
        initialValues={DEFAULT_CUSTOMER_FORM_VALUES}
        submitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(RouteConstants.customers.base.path)}
      />
    </Stack>
  );
}
