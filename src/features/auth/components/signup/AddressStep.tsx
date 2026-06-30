import { Button, Flex, Grid, Stack } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomInput } from "@/components/input";
import { useCreateOrganizationAddress } from "@/features/settings/api";
import {
  type CreateOrgAddressPayload,
  type OrgAddressType,
} from "@/shared/interface/settings";

// const TYPE_OPTIONS = ORG_ADDRESS_TYPES.map((t) => ({
//   label: t.charAt(0) + t.slice(1).toLowerCase(),
//   value: t,
// }));

const validationSchema = Yup.object({
  addressLine1: Yup.string().required("Address line 1 is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  country: Yup.string().required("Country is required"),
});

interface AddressStepProps {
  onCompleted: () => void;
  onSkip: () => void;
}

export function AddressStep({ onCompleted, onSkip }: AddressStepProps) {
  const { mutateAsync, isPending } = useCreateOrganizationAddress();

  const formik = useFormik({
    initialValues: {
      label: "",
      type: "OFFICE" as OrgAddressType,
      attention: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "Nigeria",
      postalCode: "",
      phone: "",
      isPrimary: true,
    },
    validationSchema,
    validateOnChange: false,
    onSubmit: async (values) => {
      const payload: CreateOrgAddressPayload = {
        label: values.label || undefined,
        type: values.type,
        attention: values.attention || undefined,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || undefined,
        city: values.city,
        state: values.state || undefined,
        country: values.country,
        postalCode: values.postalCode || undefined,
        phone: values.phone || undefined,
        isPrimary: values.isPrimary,
      };
      await mutateAsync(payload);
      onCompleted();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="4">
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
          <CustomInput
            label="Label"
            name="label"
            value={formik.values.label}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Head Office"
          />
          {/* <CustomSelect
            label="Type"
            options={TYPE_OPTIONS}
            value={[formik.values.type]}
            onChange={(opt: { value: string[] }) =>
              formik.setFieldValue("type", opt?.value?.[0] ?? "BILLING")
            }
          /> */}
        </Grid>
        <CustomInput
          label="Address Line 1"
          required
          name="addressLine1"
          value={formik.values.addressLine1}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="e.g. 12 Allen Avenue"
          error={
            formik.touched.addressLine1 && formik.errors.addressLine1
              ? formik.errors.addressLine1
              : undefined
          }
        />
        <CustomInput
          label="Address Line 2"
          name="addressLine2"
          value={formik.values.addressLine2}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Optional"
        />
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap="4">
          <CustomInput
            label="City"
            required
            name="city"
            value={formik.values.city}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Lagos"
            error={
              formik.touched.city && formik.errors.city
                ? formik.errors.city
                : undefined
            }
          />
          <CustomInput
            label="State"
            required
            name="state"
            value={formik.values.state}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Lagos"
            error={
              formik.touched.state && formik.errors.state
                ? formik.errors.state
                : undefined
            }
          />
          <CustomInput
            label="Country"
            required
            name="country"
            value={formik.values.country}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Nigeria"
            error={
              formik.touched.country && formik.errors.country
                ? formik.errors.country
                : undefined
            }
          />
        </Grid>
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
          <CustomInput
            label="Postal Code"
            name="postalCode"
            value={formik.values.postalCode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Optional"
          />
          {/* <CustomInput
            label="Phone"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Optional"
          /> */}
        </Grid>
        {/* <CustomSwitch
          reversed
          checked={formik.values.isPrimary}
          onCheckedChange={(e: { checked: boolean }) =>
            formik.setFieldValue("isPrimary", e.checked)
          }
        >
          Set as primary address
        </CustomSwitch> */}

        <Flex gap="3" pt="2">
          <Button
            variant="outline"
            flex="1"
            onClick={onSkip}
            disabled={isPending}
          >
            Skip for now
          </Button>
          <Button
            type="submit"
            flex="1"
            loading={isPending}
            loadingText="Saving..."
          >
            Finish
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
