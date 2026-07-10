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

export function GenerateInspectionTemplate() {
  const form = useInspectionForm();
  const { formik, isSubmitting } = form;

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
            Create Inspection
          </Heading>
          <Text textStyle="sm" color="gray.200" mt="1">
            Log vehicle inspection findings. You can send or download the PDF
            report once it&apos;s created.
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
              loadingText="Creating..."
              _hover={{ bg: "primary.400" }}
            >
              Create Inspection
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
}
