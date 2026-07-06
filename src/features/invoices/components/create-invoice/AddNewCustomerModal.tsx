import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import type {
  CreateCustomerPayload,
  CustomerType,
  ICustomer,
} from "@/shared/interface/customer";
import { useCreateCustomerMutation } from "@/features/customers/api/query";
import { removeFalsyAndEmptyArrayFields } from "@/utils/object-formatter";

interface AddNewCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: ICustomer) => void;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  displayName: Yup.string().required("Display name is required"),
  email: Yup.string().email("Invalid email"),
  phone: Yup.string(),
  type: Yup.string().required("Customer type is required"),
  stage: Yup.string().required("Customer stage is required"),
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

export function AddNewCustomerModal({
  open,
  onClose,
  onSave,
}: AddNewCustomerModalProps) {
  const { mutateAsync, isPending } = useCreateCustomerMutation();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      email: "",
      phone: "",
      type: "individual",
      stage: "CUSTOMER",
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const res = await mutateAsync(
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

      // Backend returns the newly created client. Merge it over a record built
      // from the form values so the combobox always has id/displayName/email to
      // select on, even if the response omits a field.
      const serverCustomer = (res?.data ?? res ?? {}) as Partial<ICustomer>;
      const created = {
        firstName: values.firstName,
        middleName: "",
        lastName: values.lastName,
        company: "",
        displayName: values.displayName,
        email: values.email,
        phone: values.phone,
        stage: values.stage,
        jobTitle: null,
        type: values.type,
        consultedBy: null,
        source: null,
        affiliate: null,
        lastConsultationDate: null,
        referralSource: null,
        utmSource: null,
        utmCampaign: null,
        utmMedium: null,
        utmContent: null,
        organizationId: "",
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        country: values.country || null,
        dob: null,
        postalCode: null,
        status: "active",
        emailMarketingConsent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...serverCustomer,
        id: serverCustomer.id ?? "",
      } as ICustomer;

      onSave(created);
      resetForm();
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const hasName =
    formik.values.firstName.trim().length > 0 &&
    formik.values.lastName.trim().length > 0;

  const displayNameOptions = hasName
    ? [
        {
          label: `${formik.values.firstName} ${formik.values.lastName}`,
          value: `${formik.values.firstName} ${formik.values.lastName}`,
        },
        {
          label: `${formik.values.lastName} ${formik.values.firstName}`,
          value: `${formik.values.lastName} ${formik.values.firstName}`,
        },
      ]
    : [];

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    const newFirst = e.target.value.trim();
    const last = formik.values.lastName.trim();
    formik.setFieldValue(
      "displayName",
      newFirst && last ? `${newFirst} ${last}` : "",
    );
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    const first = formik.values.firstName.trim();
    const newLast = e.target.value.trim();
    formik.setFieldValue(
      "displayName",
      first && newLast ? `${first} ${newLast}` : "",
    );
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) handleClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="520px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Add New Customer
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
                  {/* First / Last name */}
                  <Grid
                    templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                    gap="4"
                  >
                    <CustomInput
                      label="First Name"
                      placeholder="e.g. Emeka"
                      required
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={handleFirstNameChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.firstName && formik.errors.firstName
                          ? formik.errors.firstName
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Last Name"
                      placeholder="e.g. Okafor"
                      required
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={handleLastNameChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.lastName && formik.errors.lastName
                          ? formik.errors.lastName
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
                      formik.values.displayName
                        ? [formik.values.displayName]
                        : undefined
                    }
                    onChange={(opt: { value: string[] }) => {
                      formik.setFieldValue(
                        "displayName",
                        opt?.value?.[0] ?? "",
                      );
                    }}
                    disabled={!hasName}
                    error={
                      formik.touched.displayName && formik.errors.displayName
                        ? formik.errors.displayName
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
                      value={
                        formik.values.type ? [formik.values.type] : undefined
                      }
                      onChange={(opt: { value: string[] }) => {
                        formik.setFieldValue("type", opt?.value?.[0] ?? "");
                      }}
                      error={
                        formik.touched.type && formik.errors.type
                          ? formik.errors.type
                          : undefined
                      }
                    />
                    <CustomSelect
                      label="Stage"
                      required
                      options={STAGE_OPTIONS}
                      placeholder="Select stage..."
                      value={
                        formik.values.stage ? [formik.values.stage] : undefined
                      }
                      onChange={(opt: { value: string[] }) => {
                        formik.setFieldValue("stage", opt?.value?.[0] ?? "");
                      }}
                      error={
                        formik.touched.stage && formik.errors.stage
                          ? formik.errors.stage
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
                      placeholder="e.g. emeka@company.com"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.email && formik.errors.email
                          ? formik.errors.email
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Phone Number"
                      placeholder="e.g. +234 801 234 5678"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.phone && formik.errors.phone
                          ? formik.errors.phone
                          : undefined
                      }
                    />
                  </Grid>

                  {/* Address */}
                  <CustomInput
                    label="Street Address"
                    placeholder="e.g. 12 Allen Avenue"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Grid
                    templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }}
                    gap="4"
                  >
                    <CustomInput
                      label="City"
                      placeholder="e.g. Lagos"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <CustomInput
                      label="State"
                      placeholder="e.g. Lagos State"
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <CustomInput
                      label="Country"
                      placeholder="e.g. Nigeria"
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Grid>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
                <Flex gap="3" justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isPending}
                    loadingText="Saving..."
                  >
                    Save Customer
                  </Button>
                </Flex>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
