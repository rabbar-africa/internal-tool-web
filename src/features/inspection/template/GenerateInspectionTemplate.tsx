import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Flex,
  Heading,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";
import { UserDashboardContainer } from "@/components/hoc";
import {
  CustomerInfoSection,
  VehicleInfoSection,
  FindingsSection,
  AdditionalNotesSection,
} from "../components/generate-inspection";
import type { InspectionFormValues } from "../components/generate-inspection";

// ─── Validation ──────────────────────────────────────────────────────────────

const findingSchema = Yup.object().shape({
  component: Yup.string().required("Component is required"),
  status: Yup.string().required("Status is required"),
  observation: Yup.string(),
});

const validationSchema = Yup.object().shape({
  customerTitle: Yup.string().required("Title is required"),
  customerName: Yup.string().required("Customer name is required"),
  vehicleNumber: Yup.string().required("Vehicle number is required"),
  vehicleName: Yup.string().required("Vehicle name is required"),
  vehicleColor: Yup.string().required("Vehicle color is required"),
  jobCode: Yup.string().required("Job code is required"),
  inspectionDate: Yup.string().required("Inspection date is required"),
  findings: Yup.array()
    .of(findingSchema)
    .min(1, "At least one finding is required"),
  additionalNotes: Yup.string(),
});

// ─── Initial values ──────────────────────────────────────────────────────────

const initialValues: InspectionFormValues = {
  customerTitle: "",
  customerName: "",
  vehicleNumber: "",
  vehicleName: "",
  vehicleColor: "",
  jobCode: "",
  findings: [{ component: "", observation: "", status: "" }],
  additionalNotes: "",
  inspectionDate: new Date().toISOString().split("T")[0],
};

// ─── Component ───────────────────────────────────────────────────────────────

export function GenerateInspectionTemplate() {
  const handleSubmit = async (values: InspectionFormValues) => {
    // TODO: call your API endpoint here

    void values;
  };

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        {/* ── Page Header ── */}
        <Flex
          justify="space-between"
          align={{ base: "start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Heading
              as="h4"
              fontSize="1.5rem"
              fontWeight="600"
              color="gray.500"
            >
              Generate Inspection Report
            </Heading>
            <Text textStyle="sm" color="gray.200" mt="1">
              Log vehicle inspection findings to generate a PDF report.
            </Text>
          </Box>
        </Flex>

        {/* ── Formik Form ── */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Stack gap="6">
                <CustomerInfoSection />
                <VehicleInfoSection />

                <FieldArray name="findings">
                  {(arrayHelpers) => (
                    <FindingsSection arrayHelpers={arrayHelpers} />
                  )}
                </FieldArray>

                <AdditionalNotesSection />

                {/* ── Actions ── */}
                <Separator borderColor="gray.75" />

                <Flex
                  justify="flex-end"
                  gap="3"
                  direction={{ base: "column-reverse", sm: "row" }}
                >
                  <Button
                    variant="outline"
                    borderColor="gray.100"
                    color="gray.300"
                    size="lg"
                    type="button"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    bg="primary.300"
                    color="white"
                    size="lg"
                    loading={isSubmitting}
                    loadingText="Generating..."
                    _hover={{ bg: "primary.400" }}
                  >
                    <LuSend /> Generate &amp; Send Report
                  </Button>
                </Flex>
              </Stack>
            </Form>
          )}
        </Formik>
      </Stack>
    </UserDashboardContainer>
  );
}
