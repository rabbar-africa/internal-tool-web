import { memo } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input";
import {
  SearchCombobox,
  type SearchComboboxOption,
} from "@/components/input/SearchCombobox";
import { STATUS_OPTIONS } from "./inspection-form.types";
import type { Finding } from "./inspection-form.types";
import { FileTextIcon, PlusIcon, TrashIcon } from "@/assets/custom";
import type { InspectionFormApi } from "./useInspectionForm";

interface FindingRowProps {
  index: number;
  finding: Finding;
  error?: Record<string, string>;
  touched?: Record<string, boolean>;
  componentOptions: SearchComboboxOption[];
  componentsLoading: boolean;
  showRemove: boolean;
  // All of these are identity-stable (see useInspectionForm) so the memo holds.
  setFieldValue: InspectionFormApi["formik"]["setFieldValue"];
  handleChange: InspectionFormApi["formik"]["handleChange"];
  handleBlur: InspectionFormApi["formik"]["handleBlur"];
  onComponentSearch: (query: string) => void;
  onRemove: (index: number) => void;
}

/**
 * One finding row, memoized: Formik re-renders the whole form on every
 * keystroke, and without this every row (and its two comboboxes) re-renders
 * while typing in any single field. All props are either row-scoped values
 * (whose identity only changes when THIS row is edited) or identity-stable
 * handlers, so shallow comparison skips untouched rows.
 */
const FindingRow = memo(function FindingRow({
  index,
  finding,
  error,
  touched,
  componentOptions,
  componentsLoading,
  showRemove,
  setFieldValue,
  handleChange,
  handleBlur,
  onComponentSearch,
  onRemove,
}: FindingRowProps) {
  return (
    <Box
      p="4"
      rounded="lg"
      borderWidth="1px"
      borderColor="gray.50"
      bg="gray.50/50"
    >
      <Flex justify="space-between" align="center" mb="3">
        <HStack gap="2">
          <Flex
            w="6"
            h="6"
            bg="primary.300"
            rounded="full"
            align="center"
            justify="center"
          >
            <Text color="white" fontSize="xs" fontWeight="700">
              {index + 1}
            </Text>
          </Flex>
          <Text fontSize=".8rem" fontWeight="600" color="gray.400">
            Finding #{index + 1}
          </Text>
        </HStack>
        {showRemove && (
          <IconButton
            aria-label="Remove finding"
            size="xs"
            variant="ghost"
            color="error.300"
            onClick={() => onRemove(index)}
          >
            <TrashIcon />
          </IconButton>
        )}
      </Flex>

      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
        <GridItem>
          <SearchCombobox
            label="Component"
            placeholder="Search or type a component..."
            required
            options={componentOptions}
            value={finding.component || undefined}
            inputValue={finding.component}
            serverSearch
            isLoading={componentsLoading}
            onSearchChange={onComponentSearch}
            onChange={(val) =>
              void setFieldValue(`findings.${index}.component`, val)
            }
            onInputChange={(text) =>
              void setFieldValue(`findings.${index}.component`, text)
            }
            emptyText="No matching component. Keep typing to add it manually."
            error={
              touched?.component && error?.component
                ? error.component
                : undefined
            }
          />
        </GridItem>
        <GridItem>
          <SearchCombobox
            label="Status"
            placeholder="Select or type a status..."
            required
            options={STATUS_OPTIONS}
            value={finding.status || undefined}
            onChange={(val) =>
              void setFieldValue(`findings.${index}.status`, val)
            }
            onInputChange={(text) =>
              void setFieldValue(`findings.${index}.status`, text)
            }
            emptyText="No matching status. Keep typing to use it as-is."
            error={touched?.status && error?.status ? error.status : undefined}
          />
        </GridItem>
      </Grid>

      <Box mt="4">
        <CustomInput
          label="Observation Details"
          placeholder="e.g. Faulty and require replacement"
          name={`findings.${index}.observation`}
          value={finding.observation}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
    </Box>
  );
});

export function FindingsSection({ form }: { form: InspectionFormApi }) {
  const {
    formik,
    addFinding,
    removeFinding,
    componentOptions,
    componentsLoading,
    handleComponentSearch,
  } = form;
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  const findings = values.findings;
  const findingErrors = errors.findings as
    | Array<Record<string, string> | undefined>
    | undefined;
  const findingTouched = touched.findings as
    | Array<Record<string, boolean> | undefined>
    | undefined;

  return (
    <Card.Root borderColor="gray.75" shadow="none" borderWidth="1px">
      <Card.Header pb="0">
        <Flex justify="space-between" align="center" w="full">
          <HStack gap="2">
            <Flex
              w="8"
              h="8"
              bg="primary.50"
              rounded="lg"
              align="center"
              justify="center"
            >
              <FileTextIcon color="var(--chakra-colors-primary-300)" />
            </Flex>
            <Box>
              <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                Inspection Findings
              </Text>
              <Text textStyle="xs" color="gray.200">
                Log each component inspected and its status
              </Text>
            </Box>
          </HStack>
          <Button
            size="sm"
            variant="outline"
            borderColor="primary.300"
            color="primary.300"
            onClick={addFinding}
          >
            <PlusIcon />
            <Text display={{ base: "none", sm: "inline" }}>Add Finding</Text>
          </Button>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Stack gap="4">
          {findings.map((finding, index) => (
            <FindingRow
              key={index}
              index={index}
              finding={finding}
              error={findingErrors?.[index]}
              touched={findingTouched?.[index]}
              componentOptions={componentOptions}
              componentsLoading={componentsLoading}
              showRemove={findings.length > 1}
              setFieldValue={setFieldValue}
              handleChange={handleChange}
              handleBlur={handleBlur}
              onComponentSearch={handleComponentSearch}
              onRemove={removeFinding}
            />
          ))}

          {findings.length >= 1 && (
            <Button
              variant="ghost"
              size="sm"
              color="primary.300"
              alignSelf="center"
              onClick={addFinding}
            >
              <PlusIcon /> Add Another Finding
            </Button>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
