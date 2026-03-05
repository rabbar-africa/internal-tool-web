import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { FormikErrors, FormikProps, FormikTouched } from "formik";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import type { SearchComboboxOption } from "@/components/input/SearchCombobox";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { formatCurrency } from "@/utils/calculations";
import type {
  CreateInvoiceFormValues,
  LineItemFormRow,
} from "./hooks/useCreateInvoice";
import type { Item } from "@/shared/interface/item";
import { AddNewItemModal } from "./AddNewItemModal";

interface LineItemsTableProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  removeLineItem: (index: number) => void;
  addLineItem: () => void;
  items: Item[];
  handleItemSelect: (idx: number, itemId: string) => void;
  getLineAmount: (li: LineItemFormRow) => number;
  onAddNewItem: (item: Item) => void;
}

const COL_WIDTHS = "36px 1fr 90px 130px 80px 100px 36px";

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
      {["#", "Item Details", "Qty", "Rate (₦)", "Disc", "Amount"].map(
        (col, i) => (
          <Text
            key={col}
            fontSize="11px"
            fontWeight="600"
            color="gray.300"
            textTransform="uppercase"
            textAlign={i === 5 ? "right" : "left"}
          >
            {col}
          </Text>
        ),
      )}
      <Box />
    </Grid>
  );
}

interface LineItemRowProps {
  idx: number;
  formik: FormikProps<CreateInvoiceFormValues>;
  searchOptions: SearchComboboxOption[];
  handleItemSelect: (idx: number, itemId: string) => void;
  lineAmount: number;
  canRemove: boolean;
  onRemove: () => void;
  onOpenAddItem: () => void;
}

function LineItemRow({
  idx,
  formik,
  searchOptions,
  handleItemSelect,
  lineAmount,
  canRemove,
  onRemove,
  onOpenAddItem,
}: LineItemRowProps) {
  const lineItem = formik.values.line_items[idx];
  const lineErrors = (
    formik.errors.line_items as FormikErrors<LineItemFormRow>[] | undefined
  )?.[idx];
  const lineTouched = (
    formik.touched.line_items as FormikTouched<LineItemFormRow>[] | undefined
  )?.[idx];

  const fieldError = (field: keyof LineItemFormRow) => {
    if (lineTouched?.[field] || formik.submitCount > 0) {
      return lineErrors?.[field] as string | undefined;
    }
    return undefined;
  };

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
          <SearchCombobox
            options={searchOptions}
            value={lineItem.item_id || undefined}
            onChange={(val) => handleItemSelect(idx, val)}
            placeholder="Select or type an item..."
            footerAction={{
              label: "Add New Item",
              onClick: onOpenAddItem,
            }}
          />
          <CustomInput
            placeholder="Item description"
            name={`line_items.${idx}.description`}
            value={lineItem.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            inputProps={{ fontSize: "12px" }}
            error={fieldError("description")}
          />
        </Stack>

        <CustomNumberInput
          placeholder="1"
          precision={2}
          value={lineItem.quantity}
          onValueChange={(raw) =>
            formik.setFieldValue(`line_items.${idx}.quantity`, raw)
          }
          onBlur={formik.handleBlur}
          name={`line_items.${idx}.quantity`}
          error={fieldError("quantity")}
        />

        <CustomNumberInput
          placeholder="0.00"
          precision={2}
          value={lineItem.rate}
          onValueChange={(raw) =>
            formik.setFieldValue(`line_items.${idx}.rate`, raw)
          }
          onBlur={formik.handleBlur}
          name={`line_items.${idx}.rate`}
          error={fieldError("rate")}
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
          <SearchCombobox
            label="Item"
            options={searchOptions}
            value={lineItem.item_id || undefined}
            onChange={(val) => handleItemSelect(idx, val)}
            placeholder="Select or type an item..."
            footerAction={{
              label: "Add New Item",
              onClick: onOpenAddItem,
            }}
          />
          <CustomInput
            label="Description"
            placeholder="Item description"
            name={`line_items.${idx}.description`}
            value={lineItem.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("description")}
          />
          <Grid templateColumns="1fr 1fr 1fr" gap="3">
            <CustomNumberInput
              label="Qty"
              placeholder="1"
              precision={2}
              value={lineItem.quantity}
              onValueChange={(raw) =>
                formik.setFieldValue(`line_items.${idx}.quantity`, raw)
              }
              onBlur={formik.handleBlur}
              name={`line_items.${idx}.quantity`}
              error={fieldError("quantity")}
            />
            <CustomNumberInput
              label="Rate (₦)"
              placeholder="0.00"
              precision={2}
              value={lineItem.rate}
              onValueChange={(raw) =>
                formik.setFieldValue(`line_items.${idx}.rate`, raw)
              }
              onBlur={formik.handleBlur}
              name={`line_items.${idx}.rate`}
              error={fieldError("rate")}
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
  items,
  handleItemSelect,
  getLineAmount,
  onAddNewItem,
}: LineItemsTableProps) {
  const [addItemOpen, setAddItemOpen] = useState(false);

  const searchOptions: SearchComboboxOption[] = useMemo(
    () =>
      items.map((item) => ({
        label: item.name,
        value: item.id,
        subLabel: `Rate: ₦${item.unitPrice.toLocaleString("en-US")}`,
      })),
    [items],
  );

  return (
    <Box>
      <TableHeader />

      {formik.values.line_items.map((lineItem, idx) => (
        <LineItemRow
          key={idx}
          idx={idx}
          formik={formik}
          searchOptions={searchOptions}
          handleItemSelect={handleItemSelect}
          lineAmount={getLineAmount(lineItem)}
          canRemove={formik.values.line_items.length > 1}
          onRemove={() => removeLineItem(idx)}
          onOpenAddItem={() => setAddItemOpen(true)}
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

      <AddNewItemModal
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        onSave={(item) => {
          onAddNewItem(item);
          setAddItemOpen(false);
        }}
      />
    </Box>
  );
}
