import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { UserDashboardContainer } from "@/components/hoc";
import SectionLoader from "@/components/common/SectionLoader";
import { CustomBreadCrumb } from "@/components/elements/custom-breadcrumb";
import { RouteConstants } from "@/shared/constants/routes";
import {
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
} from "../../api/query";
import type {
  CreateCustomerPayload,
  ICustomer,
} from "@/shared/interface/customer";
import { removeFalsyAndEmptyArrayFields } from "@/utils/object-formatter";
import {
  CustomerForm,
  type CustomerFormValues,
} from "../customer-form/CustomerForm";

export function EditCustomerPage() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();

  const { data, isLoading } = useGetCustomerByIdQuery(id);
  const { mutateAsync, isPending } = useUpdateCustomerMutation(id);

  const customer = data?.data as ICustomer | undefined;

  const detailPath = RouteConstants.customers.detail.generate({ id });

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
      }) as Partial<CreateCustomerPayload>,
    );
    navigate(detailPath);
  };

  if (isLoading) {
    return <SectionLoader h="60vh" />;
  }

  if (!customer) {
    return (
      <UserDashboardContainer py="1.5rem">
        <Text color="gray.400">Customer not found.</Text>
      </UserDashboardContainer>
    );
  }

  const initialValues: CustomerFormValues = {
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    displayName: customer.displayName ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    type: customer.type ?? "",
    stage: customer.stage ?? "",
    address: customer.address ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    country: customer.country ?? "Nigeria",
  };

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <CustomBreadCrumb
          items={[
            { label: "Customers", to: RouteConstants.customers.base.path },
            { label: customer.displayName, to: detailPath },
            { label: "Edit", isCurrent: true },
          ]}
        />

        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              Edit Customer
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="1">
              Update {customer.displayName}&apos;s information
            </Text>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(detailPath)}
          >
            Cancel
          </Button>
        </Flex>

        <CustomerForm
          mode="edit"
          initialValues={initialValues}
          submitting={isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(detailPath)}
        />
      </Stack>
    </UserDashboardContainer>
  );
}
