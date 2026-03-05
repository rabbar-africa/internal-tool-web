import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomInput } from "@/components/input/CustomInput";
import { formatCurrency } from "@/utils/calculations";
import type {
  CreateInvoiceFormValues,
  LineItemFormRow,
} from "./hooks/useCreateInvoice";

interface LineItemsTableProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  removeLineItem: (index: number) => void;
  addLineItem: () => void;
  itemOptions: { label: string; value: string }[];
  handleItemSelect: (idx: number, itemId: string) => void;
  getLineAmount: (li: LineItemFormRow) => number;
}

const COL_WIDTHS = "36px 1fr 80px 120px 80px 100px 36px";

function TableHeader() {
  return (
    <Grid
      templateColumns={COL_WIDTHS}
      gap="2"
      px="4"
      py="2"
      bg="gray.25"
      borderBottomWidth="1px"
      borderColor="gray.75"
      display={{ base: "none", lg: "grid" }}
    >
      <Text
        fontSize="11px"
        fontWeight="600"
        color="gray.300"
        textTransform="uppercase"
      >
        #
      </Text>
      <Text
        fontSize="11px"
        fontWeight="600"
        color="gray.300"
        textTransform="uppercase"
      >
        Item Details
      </Text>
      <Text
        fontSize="11px"
        fontWeight="600"
        color="gray.300"
        textTransform="uppercase"
      >
        Qty
      </Text>
      <Text
        fontSize="11px"
        fontWeight="600"
        color="gray.300"
        textTransform="uppercase"
      >
        Rate (₦)
      </Text>
      <Text
        fontSize="11px"
        fontWeight="600"
        color="gray.300"
        textTransform="uppercase"
      >
        Disc
      </Text>
      <Text
        fontSize="11px"
        fontWeight="600"
        color="gray.300"
        textTransform="uppercase"
        textAlign="right"
      >
        Amount
      </Text>
      <Box />
    </Grid>
  );
}

interface LineItemRowProps {
  idx: number;
  formik: FormikProps<CreateInvoiceFormValues>;
  itemOptions: { label: string; value: string }[];
  handleItemSelect: (idx: number, itemId: string) => void;
  lineAmount: number;
  canRemove: boolean;
  onRemove: () => void;
}

function LineItemRow({
  idx,
  formik,
  itemOptions,
  handleItemSelect,
  lineAmount,
  canRemove,
  onRemove,
}: LineItemRowProps) {
  const lineItem = formik.values.line_items[idx];
  return (
    <>
      {/* Desktop layout */}
      <Grid
        templateColumns={COL_WIDTHS}
        gap="2"
        px="4"
        py="3"
        borderBottomWidth="1px"
        borderColor="gray.50"
        alignItems="start"
        display={{ base: "none", lg: "grid" }}
        _hover={{ bg: "gray.25" }}
        transition="background 0.1s"
      >
        <Flex align="center" h="40px">
          <Text fontSize="13px" color="gray.300" fontWeight="500">
            {idx + 1}
          </Text>
        </Flex>

        <Stack gap="1.5">
          <CustomSelect
            options={itemOptions}
            placeholder="Select or type an item..."
            value={lineItem.item_id ? [lineItem.item_id] : undefined}
            onChange={(opt: { value: string[] }) => {
              const val = Array.isArray(opt?.value)
                ? opt.value[0]
                : (opt?.value ?? "");
              formik.setFieldValue(`line_items.${idx}.item_id`, val);
              if (val) handleItemSelect(idx, val);
            }}
          />
          <CustomInput
            placeholder="Item description"
            name={`line_items.${idx}.description`}
            value={lineItem.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            inputProps={{ fontSize: "12px" }}
          />
        </Stack>

        <CustomInput
          placeholder="1"
          name={`line_items.${idx}.quantity`}
          value={lineItem.quantity}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <CustomInput
          placeholder="0.00"
          name={`line_items.${idx}.rate`}
          value={lineItem.rate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <CustomInput
          placeholder="0%"
          name={`line_items.${idx}.discount`}
          value={lineItem.discount}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <Flex align="center" justify="flex-end" h="40px">
          <Text fontSize="13px" fontWeight="500" color="gray.500">
            {formatCurrency(lineAmount)}
          </Text>
        </Flex>

        <Flex align="center" justify="center" h="40px">
          {canRemove && (
            <IconButton
              aria-label="Remove item"
              variant="ghost"
              size="xs"
              color="gray.300"
              _hover={{ color: "red.400", bg: "red.50" }}
              onClick={onRemove}
            >
              ×
            </IconButton>
          )}
        </Flex>
      </Grid>

      {/* Mobile layout */}
      <Box
        px="4"
        py="4"
        borderBottomWidth="1px"
        borderColor="gray.50"
        display={{ base: "block", lg: "none" }}
      >
        <Flex justify="space-between" align="center" mb="3">
          <Text fontSize="13px" fontWeight="600" color="gray.400">
            Item {idx + 1}
          </Text>
          {canRemove && (
            <Button
              variant="ghost"
              size="xs"
              color="red.400"
              onClick={onRemove}
            >
              Remove
            </Button>
          )}
        </Flex>
        <Stack gap="3">
          <CustomSelect
            label="Item"
            options={itemOptions}
            placeholder="Select or type an item..."
            value={lineItem.item_id ? [lineItem.item_id] : undefined}
            onChange={(opt: { value: string[] }) => {
              const val = Array.isArray(opt?.value)
                ? opt.value[0]
                : (opt?.value ?? "");
              formik.setFieldValue(`line_items.${idx}.item_id`, val);
              if (val) handleItemSelect(idx, val);
            }}
          />
          <CustomInput
            label="Description"
            placeholder="Item description"
            name={`line_items.${idx}.description`}
            value={lineItem.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <Grid templateColumns="1fr 1fr 1fr" gap="3">
            <CustomInput
              label="Qty"
              placeholder="1"
              name={`line_items.${idx}.quantity`}
              value={lineItem.quantity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <CustomInput
              label="Rate (₦)"
              placeholder="0.00"
              name={`line_items.${idx}.rate`}
              value={lineItem.rate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <CustomInput
              label="Disc"
              placeholder="0%"
              name={`line_items.${idx}.discount`}
              value={lineItem.discount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>
          <Flex justify="flex-end">
            <Text fontSize="13px" color="gray.400">
              Amount:{" "}
              <Text as="span" fontWeight="600" color="gray.500">
                {formatCurrency(lineAmount)}
              </Text>
            </Text>
          </Flex>
        </Stack>
      </Box>
    </>
  );
}

export function LineItemsTable({
  formik,
  removeLineItem,
  addLineItem,
  itemOptions,
  handleItemSelect,
  getLineAmount,
}: LineItemsTableProps) {
  return (
    <Box>
      <TableHeader />

      {formik.values.line_items.map((lineItem, idx) => (
        <LineItemRow
          key={idx}
          idx={idx}
          formik={formik}
          itemOptions={itemOptions}
          handleItemSelect={handleItemSelect}
          lineAmount={getLineAmount(lineItem)}
          canRemove={formik.values.line_items.length > 1}
          onRemove={() => removeLineItem(idx)}
        />
      ))}

      <Box px="4" py="3">
        <Button
          variant="ghost"
          size="sm"
          color="primary.300"
          fontWeight="500"
          _hover={{ bg: "primary.50" }}
          onClick={addLineItem}
        >
          + Add a new line
        </Button>
      </Box>
    </Box>
  );
}
