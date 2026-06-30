import { useState } from "react";
import { Box, Button, Grid, Stack, Text } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomInput, CustomSelect } from "@/components/input";
import { EyeIcon, EyeOff } from "@/assets/custom";
import { useRegisterMutation } from "../../api";
import type { RegisterPayload } from "../../api/types";

const CURRENCY_OPTIONS = [
  { label: "Nigerian Naira (NGN)", value: "NGN" },
  { label: "US Dollar (USD)", value: "USD" },
  { label: "British Pound (GBP)", value: "GBP" },
  { label: "Euro (EUR)", value: "EUR" },
  { label: "Ghanaian Cedi (GHS)", value: "GHS" },
  { label: "Kenyan Shilling (KES)", value: "KES" },
];

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Organization name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: Yup.string().trim().required("Phone is required"),
  ownerFirstName: Yup.string().trim().required("First name is required"),
  ownerLastName: Yup.string().trim().required("Last name is required"),
  ownerPassword: Yup.string()
    .min(8, "At least 8 characters")
    .required("Password is required"),
});

// Derive a URL-safe slug from the org name, with a random fallback.
const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || Math.random().toString(36).slice(2, 8);

interface OrganizationStepProps {
  onCompleted: (ownerEmail: string) => void;
}

export function OrganizationStep({ onCompleted }: OrganizationStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isPending } = useRegisterMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      website: "",
      taxId: "",
      currency: "NGN",
      timezone: "Africa/Lagos",
      ownerFirstName: "",
      ownerLastName: "",
      ownerPassword: "",
    },
    validationSchema,
    validateOnChange: false,
    onSubmit: async (values) => {
      const payload: RegisterPayload = {
        name: values.name.trim(),
        slug: slugify(values.name),
        // A single email/phone is shared by the org and the owner account.
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        website: values.website || undefined,
        taxId: values.taxId || undefined,
        currency: values.currency || undefined,
        timezone: values.timezone || undefined,
        ownerFirstName: values.ownerFirstName.trim(),
        ownerLastName: values.ownerLastName.trim(),
        ownerEmail: values.email.trim().toLowerCase(),
        ownerPassword: values.ownerPassword,
        ownerPhone: values.phone.trim(),
      };
      await mutateAsync(payload);
      onCompleted(payload.ownerEmail);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="5">
        <Box>
          <Text fontSize="13px" fontWeight="600" color="gray.500" mb="3">
            Organization details
          </Text>
          <Stack gap="4">
            <CustomInput
              label="Organization Name"
              required
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. Rabbar Africa"
              error={
                formik.touched.name && formik.errors.name
                  ? formik.errors.name
                  : undefined
              }
            />
            {/* <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
              <CustomInput
                label="Website"
                name="website"
                value={formik.values.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="https://example.com"
              />
              <CustomInput
                label="Tax ID"
                name="taxId"
                value={formik.values.taxId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Optional"
              />
            </Grid> */}
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
              <CustomSelect
                label="Currency"
                options={CURRENCY_OPTIONS}
                value={
                  formik.values.currency ? [formik.values.currency] : ["NGN"]
                }
                onChange={(opt: { value: string[] }) =>
                  formik.setFieldValue("currency", opt?.value?.[0] ?? "NGN")
                }
              />
              <CustomInput
                label="Timezone"
                name="timezone"
                value={formik.values.timezone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Africa/Lagos"
              />
            </Grid>
          </Stack>
        </Box>

        <Box>
          <Text fontSize="13px" fontWeight="600" color="gray.500" mb="3">
            Owner account
          </Text>
          <Stack gap="4">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
              <CustomInput
                label="First Name"
                required
                name="ownerFirstName"
                value={formik.values.ownerFirstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. Emeka"
                error={
                  formik.touched.ownerFirstName && formik.errors.ownerFirstName
                    ? formik.errors.ownerFirstName
                    : undefined
                }
              />
              <CustomInput
                label="Last Name"
                required
                name="ownerLastName"
                value={formik.values.ownerLastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. Okafor"
                error={
                  formik.touched.ownerLastName && formik.errors.ownerLastName
                    ? formik.errors.ownerLastName
                    : undefined
                }
              />
            </Grid>
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
              <CustomInput
                label="Email"
                type="email"
                required
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="you@example.com"
                error={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : undefined
                }
              />
              <CustomInput
                label="Phone"
                required
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="+234 800 000 0000"
                error={
                  formik.touched.phone && formik.errors.phone
                    ? formik.errors.phone
                    : undefined
                }
              />
            </Grid>
            <CustomInput
              label="Password"
              required
              type={showPassword ? "text" : "password"}
              name="ownerPassword"
              value={formik.values.ownerPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="At least 8 characters"
              error={
                formik.touched.ownerPassword && formik.errors.ownerPassword
                  ? formik.errors.ownerPassword
                  : undefined
              }
              rightElement={
                <Box onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? (
                    <EyeIcon cursor="pointer" w=".875rem" color="gray.700" />
                  ) : (
                    <EyeOff cursor="pointer" w=".875rem" color="gray.700" />
                  )}
                </Box>
              }
            />
          </Stack>
        </Box>

        <Button
          type="submit"
          width="full"
          loading={isPending}
          loadingText="Creating account..."
        >
          Create account
        </Button>
      </Stack>
    </form>
  );
}
