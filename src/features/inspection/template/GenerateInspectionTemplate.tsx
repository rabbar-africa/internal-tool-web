import {
  Box,
  Button,
  Flex,
  Heading,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  CustomerInfoSection,
  VehicleInfoSection,
  FindingsSection,
  AdditionalNotesSection,
} from "@/features/inspection/components/generate-inspection";
import { useInspectionForm } from "@/features/inspection/components/generate-inspection/useInspectionForm";
import SectionLoader from "@/components/common/SectionLoader";

export function GenerateInspectionTemplate({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const form = useInspectionForm({ mode });
  const { formik, isSubmitting, isEdit, isLoadingInspection } = form;

  if (isLoadingInspection) {
    return <SectionLoader />;
  }

  return (
    <Stack gap="6">
      {/* Page header */}
      <Flex
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
      >
        <Box>
          <Heading as="h4" fontSize="1.5rem" fontWeight="600" color="gray.500">
            {isEdit ? "Edit Inspection" : "Create Inspection"}
          </Heading>
          <Text textStyle="sm" color="gray.200" mt="1">
            {isEdit
              ? "Update the inspection details and findings, then save your changes."
              : "Log vehicle inspection findings. You can send or download the PDF report once it's created."}
          </Text>
        </Box>
      </Flex>

      <form onSubmit={formik.handleSubmit}>
        <Stack gap="6">
          <CustomerInfoSection form={form} />
          <VehicleInfoSection form={form} />
          <FindingsSection form={form} />
          <AdditionalNotesSection form={form} />

          <Separator borderColor="gray.75" />

          <Flex
            justify="flex-end"
            gap="3"
            direction={{ base: "column-reverse", sm: "row" }}
          >
            <Button
              type="submit"
              bg="primary.300"
              color="white"
              size="lg"
              loading={isSubmitting}
              loadingText={isEdit ? "Saving..." : "Creating..."}
              _hover={{ bg: "primary.400" }}
            >
              {isEdit ? "Save Changes" : "Create Inspection"}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
}
