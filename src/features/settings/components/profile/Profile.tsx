import { Box, Button, Flex, Grid, Stack } from "@chakra-ui/react";
import { SectionTitle } from "../SectionTitle";
import { CustomInput } from "@/components/input";
import {
  useGetOrganizationDetails,
  useUpdateOrganizationDetails,
} from "../../api";
import { useFormik } from "formik";

export function Profile() {
  const { data: organizationData } = useGetOrganizationDetails();
  const organizationDetails = organizationData?.data;
  const { mutate: updateOrganization, isPending } =
    useUpdateOrganizationDetails();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: organizationDetails?.name || "",
      companyEmail: organizationDetails?.companyEmail || "",
      phone: organizationDetails?.phone || "",
      website: organizationDetails?.website || "",
      addressLine1: organizationDetails?.addressLine1 || "",
      addressLine2: organizationDetails?.addressLine2 || "",
      city: organizationDetails?.city || "",
      state: organizationDetails?.state || "",
      rcNumber: organizationDetails?.rcNumber || "",
    },
    onSubmit: (values) => {
      updateOrganization(values);
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <Stack gap="6" pt="4">
          <SectionTitle
            title="Company Information"
            subtitle="Basic details about your business"
          />
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
            <CustomInput
              label="Company Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              name="name"
            />
            <CustomInput
              label="Business Email"
              type="email"
              value={formik.values.companyEmail}
              onChange={formik.handleChange}
              name="companyEmail"
            />
            <CustomInput
              label="Phone Number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              name="phone"
            />
            <CustomInput
              label="Website"
              value={formik.values.website}
              onChange={formik.handleChange}
              name="website"
            />
            <CustomInput
              label="RC Number"
              value={formik.values.rcNumber}
              onChange={formik.handleChange}
              name="rcNumber"
            />
            <Box gridColumn={{ sm: "1 / -1" }}>
              <CustomInput
                label="Address Line 1"
                value={formik.values.addressLine1}
                onChange={formik.handleChange}
                name="addressLine1"
              />
            </Box>
            <Box gridColumn={{ sm: "1 / -1" }}>
              <CustomInput
                label="Address Line 2"
                value={formik.values.addressLine2}
                onChange={formik.handleChange}
                name="addressLine2"
              />
            </Box>
            <CustomInput
              label="City"
              value={formik.values.city}
              onChange={formik.handleChange}
              name="city"
            />
            <CustomInput
              label="State"
              value={formik.values.state}
              onChange={formik.handleChange}
              name="state"
            />
          </Grid>
          <Flex justify="flex-end">
            <Button type="submit" loading={isPending}>
              Save Changes
            </Button>
          </Flex>
        </Stack>
      </form>
    </div>
  );
}
