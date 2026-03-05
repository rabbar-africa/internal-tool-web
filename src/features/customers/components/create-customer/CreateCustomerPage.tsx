import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { RouteConstants } from "@/shared/constants/routes";
import { useCreateCustomerMutation } from "../../api/query";
import type { CustomerType } from "@/shared/interface/customer";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  displayName: Yup.string().required("Display name is required"),
  email: Yup.string().email("Invalid email"),
  phone: Yup.string(),
  type: Yup.string().required("Customer type is required"),
  stage: Yup.string().required("Stage is required"),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  country: Yup.string(),
});

const TYPE_OPTIONS: { label: string; value: CustomerType }[] = [
  { label: "Individual", value: "individual" },
  { label: "Company / Business", value: "company" },
];

const STAGE_OPTIONS = [
  { label: "Prospect", value: "PROSPECT" },
  { label: "Lead", value: "LEAD" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Returning Customer", value: "RETURNING_CUSTOMER" },
  { label: "Inactive", value: "INACTIVE" },
];

const initialValues = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  phone: "",
  type: "",
  stage: "",
  address: "",
  city: "",
  state: "",
  country: "Nigeria",
};

export function CreateCustomerPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCustomerMutation();

  const handleSubmit = async (values: typeof initialValues) => {
    await mutateAsync({
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
    });
    navigate(RouteConstants.customers.base.path);
  };

  const sectionHeader = (num: number, title: string, subtitle?: string) => (
    <HStack gap="2">
      <Flex
        w="8"
        h="8"
        bg="primary.50"
        rounded="lg"
        align="center"
        justify="center"
      >
        <Text color="primary.300" fontSize="sm" fontWeight="600">
          {num}
        </Text>
      </Flex>
      <Box>
        <Text fontWeight="600" color="gray.500" fontSize=".875rem">
          {title}
        </Text>
        {subtitle && (
          <Text textStyle="xs" color="gray.200">
            {subtitle}
          </Text>
        )}
      </Box>
    </HStack>
  );

  return (
    <UserDashboardContainer py="1.5rem">
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

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
          }) => {
            const hasName =
              values.firstName.trim().length > 0 &&
              values.lastName.trim().length > 0;

            const displayNameOptions = hasName
              ? [
                  {
                    label: `${values.firstName} ${values.lastName}`,
                    value: `${values.firstName} ${values.lastName}`,
                  },
                  {
                    label: `${values.lastName} ${values.firstName}`,
                    value: `${values.lastName} ${values.firstName}`,
                  },
                ]
              : [];

            const handleFirstNameChange = (
              e: React.ChangeEvent<HTMLInputElement>,
            ) => {
              handleChange(e);
              const newFirst = e.target.value.trim();
              const last = values.lastName.trim();
              if (newFirst && last) {
                setFieldValue("displayName", `${newFirst} ${last}`);
              } else {
                setFieldValue("displayName", "");
              }
            };

            const handleLastNameChange = (
              e: React.ChangeEvent<HTMLInputElement>,
            ) => {
              handleChange(e);
              const first = values.firstName.trim();
              const newLast = e.target.value.trim();
              if (first && newLast) {
                setFieldValue("displayName", `${first} ${newLast}`);
              } else {
                setFieldValue("displayName", "");
              }
            };

            return (
              <Form>
                <Stack gap="5">
                  {/* Section 1: Basic Info */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        1,
                        "Basic Information",
                        "Customer contact details",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Stack gap="4">
                        {/* First / Last name */}
                        <Grid
                          templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                          gap="4"
                        >
                          <CustomInput
                            label="First Name"
                            required
                            name="firstName"
                            value={values.firstName}
                            onChange={handleFirstNameChange}
                            onBlur={handleBlur}
                            placeholder="e.g. Emeka"
                            error={
                              touched.firstName && errors.firstName
                                ? errors.firstName
                                : undefined
                            }
                          />
                          <CustomInput
                            label="Last Name"
                            required
                            name="lastName"
                            value={values.lastName}
                            onChange={handleLastNameChange}
                            onBlur={handleBlur}
                            placeholder="e.g. Okafor"
                            error={
                              touched.lastName && errors.lastName
                                ? errors.lastName
                                : undefined
                            }
                          />
                        </Grid>

                        {/* Display name */}
                        <CustomSelect
                          label="Display Name"
                          required
                          options={displayNameOptions}
                          placeholder={
                            hasName
                              ? "Select name format..."
                              : "Enter first & last name first"
                          }
                          value={
                            values.displayName
                              ? [values.displayName]
                              : undefined
                          }
                          onChange={(opt: { value: string[] }) => {
                            setFieldValue("displayName", opt?.value?.[0] ?? "");
                          }}
                          disabled={!hasName}
                          error={
                            touched.displayName && errors.displayName
                              ? errors.displayName
                              : undefined
                          }
                        />

                        {/* Type + Stage */}
                        <Grid
                          templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                          gap="4"
                        >
                          <CustomSelect
                            label="Customer Type"
                            required
                            options={TYPE_OPTIONS}
                            placeholder="Select type..."
                            value={values.type ? [values.type] : undefined}
                            onChange={(opt: { value: string[] }) => {
                              setFieldValue("type", opt?.value?.[0] ?? "");
                            }}
                            error={
                              touched.type && errors.type
                                ? errors.type
                                : undefined
                            }
                          />
                          <CustomSelect
                            label="Stage"
                            required
                            options={STAGE_OPTIONS}
                            placeholder="Select stage..."
                            value={values.stage ? [values.stage] : undefined}
                            onChange={(opt: { value: string[] }) => {
                              setFieldValue("stage", opt?.value?.[0] ?? "");
                            }}
                            error={
                              touched.stage && errors.stage
                                ? errors.stage
                                : undefined
                            }
                          />
                        </Grid>

                        {/* Email + Phone */}
                        <Grid
                          templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                          gap="4"
                        >
                          <CustomInput
                            label="Email Address"
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g. emeka@company.com"
                            error={
                              touched.email && errors.email
                                ? errors.email
                                : undefined
                            }
                          />
                          <CustomInput
                            label="Phone Number"
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g. +234 801 234 5678"
                            error={
                              touched.phone && errors.phone
                                ? errors.phone
                                : undefined
                            }
                          />
                        </Grid>
                      </Stack>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 2: Address */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        2,
                        "Address",
                        "Optional location information",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap="4"
                      >
                        <Box gridColumn={{ sm: "1 / -1" }}>
                          <CustomInput
                            label="Street Address"
                            name="address"
                            value={values.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g. 12 Allen Avenue"
                          />
                        </Box>
                        <CustomInput
                          label="City"
                          name="city"
                          value={values.city}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. Lagos"
                        />
                        <CustomInput
                          label="State"
                          name="state"
                          value={values.state}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. Lagos State"
                        />
                        <CustomInput
                          label="Country"
                          name="country"
                          value={values.country}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. Nigeria"
                          error={
                            touched.country && errors.country
                              ? errors.country
                              : undefined
                          }
                        />
                      </Grid>
                    </Card.Body>
                  </Card.Root>

                  <Flex justify="flex-end" gap="3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(RouteConstants.customers.base.path)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isPending}
                      loadingText="Saving..."
                    >
                      Add Customer
                    </Button>
                  </Flex>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Stack>
    </UserDashboardContainer>
  );
}
