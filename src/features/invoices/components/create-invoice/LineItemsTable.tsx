import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import type { FormikErrors, FormikProps, FormikTouched } from "formik";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import type { SearchComboboxOption } from "@/components/input/SearchCombobox";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type {
  CreateInvoiceFormValues,
  LineItemFormRow,
} from "@/shared/interface/invoice";
import type { Item } from "@/shared/interface/item";
import { AddNewItemModal } from "./AddNewItemModal";
import { addComma } from "@/utils/format-number";

interface LineItemsTableProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  removeLineItem: (index: number) => void;
  addLineItem: () => void;
  items: Item[];
  handleItemSelect: (idx: number, itemId: string) => void;
  getLineAmount: (li: LineItemFormRow) => number;
  onAddNewItem: (item: Item) => void;
  onItemSearch: (query: string) => void;
  isSearchingItems: boolean;
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
      {["#", "Item Details", "Qty", "Rate (₦)", "Amount"].map((col, i) => (
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
      ))}
      <Box />
    </Grid>
  );
}

interface LineItemRowProps {
  idx: number;
  lineItem: LineItemFormRow;
  isDesktop: boolean;
  // Plain strings rather than formik's error objects, which are rebuilt on
  // every validation: anything new here re-renders the row.
  nameError?: string;
  descriptionError?: string;
  quantityError?: string;
  rateError?: string;
  setFieldValue: FormikProps<CreateInvoiceFormValues>["setFieldValue"];
  handleChange: FormikProps<CreateInvoiceFormValues>["handleChange"];
  handleBlur: FormikProps<CreateInvoiceFormValues>["handleBlur"];
  searchOptions: SearchComboboxOption[];
  handleItemSelect: (idx: number, itemId: string) => void;
  lineAmount: number;
  canRemove: boolean;
  onRemove: (idx: number) => void;
  onOpenAddItem: (idx: number) => void;
  onItemSearch: (query: string) => void;
  isSearchingItems: boolean;
}

/**
 * Memoised so typing in one row doesn't re-render the others: every prop has to
 * stay the same between renders for that to work, so nothing here may be an
 * inline callback or the whole `formik` object.
 */
const LineItemRow = memo(function LineItemRow({
  idx,
  lineItem,
  isDesktop,
  nameError,
  descriptionError,
  quantityError,
  rateError,
  setFieldValue,
  handleChange,
  handleBlur,
  searchOptions,
  handleItemSelect,
  lineAmount,
  canRemove,
  onRemove,
  onOpenAddItem,
  onItemSearch,
  isSearchingItems,
}: LineItemRowProps) {
  const { formatMoney } = useFormatMoney();

  const handleNameInput = (text: string) => {
    setFieldValue(`lineItems.${idx}.name`, text);
    if (lineItem.itemId) {
      setFieldValue(`lineItems.${idx}.itemId`, "");
    }
  };
  const addItemAction = {
    label: "Add New Item",
    onClick: () => onOpenAddItem(idx),
  };

  if (isDesktop) {
    return (
      <Grid
        templateColumns={COL_WIDTHS}
        gap="2"
        px="4"
        py="3"
        borderBottomWidth="1px"
        borderColor="gray.50"
        alignItems="start"
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
            value={lineItem.itemId || undefined}
            inputValue={lineItem.name}
            serverSearch
            isLoading={isSearchingItems}
            onSearchChange={onItemSearch}
            onChange={(val) => handleItemSelect(idx, val)}
            onInputChange={handleNameInput}
            placeholder="Select or type an item name..."
            error={nameError}
            footerAction={addItemAction}
          />
          <CustomInput
            placeholder="Item description"
            name={`lineItems.${idx}.description`}
            value={lineItem.description}
            onChange={handleChange}
            onBlur={handleBlur}
            inputProps={{ fontSize: "12px" }}
            error={descriptionError}
          />
        </Stack>

        <CustomNumberInput
          placeholder="1"
          precision={2}
          value={lineItem.quantity}
          onValueChange={(raw) =>
            setFieldValue(`lineItems.${idx}.quantity`, raw)
          }
          onBlur={handleBlur}
          name={`lineItems.${idx}.quantity`}
          error={quantityError}
        />

        <CustomNumberInput
          placeholder="0.00"
          precision={2}
          value={lineItem.rate}
          onValueChange={(raw) => setFieldValue(`lineItems.${idx}.rate`, raw)}
          onBlur={handleBlur}
          name={`lineItems.${idx}.rate`}
          error={rateError}
        />

        {/* <CustomInput
          placeholder="0%"
          name={`lineItems.${idx}.discount`}
          value={lineItem.discount}
          onChange={handleChange}
          onBlur={handleBlur}
        /> */}

        <Flex align="center" justify="flex-end" h="40px">
          <Text fontSize="13px" fontWeight="500" color="gray.500">
            {formatMoney(lineAmount)}
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
              onClick={() => onRemove(idx)}
            >
              ×
            </IconButton>
          )}
        </Flex>
      </Grid>
    );
  }

  // Mobile: each row is a distinct card, so rows are easy to tell apart.
  return (
    <Box
      mx="3"
      mt="3"
      p="4"
      bg="gray.25"
      borderWidth="1px"
      borderColor="gray.100"
      rounded="xl"
      shadow="xs"
    >
      <Flex
        justify="space-between"
        align="center"
        mb="3"
        pb="2.5"
        borderBottomWidth="1px"
        borderColor="gray.100"
      >
        <Box bg="primary.50" color="primary.500" px="2.5" py="1" rounded="full">
          <Text fontSize="12px" fontWeight="600">
            Item {idx + 1}
          </Text>
        </Box>
        {canRemove && (
          <Button
            variant="ghost"
            size="xs"
            color="red.400"
            onClick={() => onRemove(idx)}
          >
            Remove
          </Button>
        )}
      </Flex>
      <Stack gap="3">
        <SearchCombobox
          label="Item Name"
          required
          options={searchOptions}
          value={lineItem.itemId || undefined}
          inputValue={lineItem.name}
          serverSearch
          isLoading={isSearchingItems}
          onSearchChange={onItemSearch}
          onChange={(val) => handleItemSelect(idx, val)}
          onInputChange={handleNameInput}
          placeholder="Select or type an item name..."
          error={nameError}
          footerAction={addItemAction}
        />
        <CustomInput
          label="Description"
          placeholder="Item description"
          name={`lineItems.${idx}.description`}
          value={lineItem.description}
          onChange={handleChange}
          onBlur={handleBlur}
          error={descriptionError}
        />
        <Grid templateColumns={{ base: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap="3">
          <CustomNumberInput
            label="Qty"
            placeholder="1"
            precision={2}
            value={lineItem.quantity}
            onValueChange={(raw) =>
              setFieldValue(`lineItems.${idx}.quantity`, raw)
            }
            onBlur={handleBlur}
            name={`lineItems.${idx}.quantity`}
            error={quantityError}
          />
          <CustomNumberInput
            label="Rate (₦)"
            placeholder="0.00"
            precision={2}
            value={lineItem.rate}
            onValueChange={(raw) => setFieldValue(`lineItems.${idx}.rate`, raw)}
            onBlur={handleBlur}
            name={`lineItems.${idx}.rate`}
            error={rateError}
          />
          {/* <CustomInput
              label="Disc"
              placeholder="0%"
              name={`lineItems.${idx}.discount`}
              value={lineItem.discount}
              onChange={handleChange}
              onBlur={handleBlur}
            /> */}
        </Grid>
        <Flex justify="flex-end">
          <Text fontSize="13px" color="gray.400">
            Amount:{" "}
            <Text as="span" fontWeight="600" color="gray.500">
              {formatMoney(lineAmount)}
            </Text>
          </Text>
        </Flex>
      </Stack>
    </Box>
  );
});

export function LineItemsTable({
  formik,
  removeLineItem,
  addLineItem,
  items,
  handleItemSelect,
  getLineAmount,
  onAddNewItem,
  onItemSearch,
  isSearchingItems,
}: LineItemsTableProps) {
  const [addItemOpen, setAddItemOpen] = useState(false);
  // Remembers which line row opened the modal so the newly created item can be
  // auto-selected back into that row.
  const [activeRowIdx, setActiveRowIdx] = useState<number | null>(null);

  // One layout at a time: mounting both and hiding one with CSS rendered every
  // input twice, on every keystroke.
  const isDesktop =
    useBreakpointValue({ base: false, lg: true }, { ssr: false }) ?? false;

  // These change every render but are only read when called, so the rows get
  // stable callbacks and stay memoised.
  const latest = useRef({ removeLineItem, handleItemSelect });
  latest.current = { removeLineItem, handleItemSelect };
  const onRemove = useCallback(
    (idx: number) => latest.current.removeLineItem(idx),
    [],
  );
  const onSelectItem = useCallback(
    (idx: number, itemId: string) =>
      latest.current.handleItemSelect(idx, itemId),
    [],
  );
  const onOpenAddItem = useCallback((idx: number) => {
    setActiveRowIdx(idx);
    setAddItemOpen(true);
  }, []);

  const lineErrors = formik.errors.lineItems as
    | FormikErrors<LineItemFormRow>[]
    | undefined;
  const lineTouched = formik.touched.lineItems as
    | FormikTouched<LineItemFormRow>[]
    | undefined;
  const fieldError = (idx: number, field: keyof LineItemFormRow) =>
    lineTouched?.[idx]?.[field] || formik.submitCount > 0
      ? (lineErrors?.[idx]?.[field] as string | undefined)
      : undefined;

  const searchOptions: SearchComboboxOption[] = useMemo(
    () =>
      items.map((item) => ({
        label: item.name,
        value: item.id,
        subLabel: `Rate: ₦${addComma(item.unitPrice)}`,
      })),
    [items],
  );

  return (
    <Box>
      <TableHeader />

      {formik.values.lineItems.map((lineItem, idx) => (
        <LineItemRow
          key={idx}
          idx={idx}
          lineItem={lineItem}
          isDesktop={isDesktop}
          nameError={fieldError(idx, "name")}
          descriptionError={fieldError(idx, "description")}
          quantityError={fieldError(idx, "quantity")}
          rateError={fieldError(idx, "rate")}
          setFieldValue={formik.setFieldValue}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          searchOptions={searchOptions}
          handleItemSelect={onSelectItem}
          lineAmount={getLineAmount(lineItem)}
          canRemove={formik.values.lineItems.length > 1}
          onRemove={onRemove}
          onItemSearch={onItemSearch}
          isSearchingItems={isSearchingItems}
          onOpenAddItem={onOpenAddItem}
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
        onClose={() => {
          setAddItemOpen(false);
          setActiveRowIdx(null);
        }}
        onSave={(item) => {
          onAddNewItem(item);
          // Auto-select the new item into the row that opened the modal.
          if (activeRowIdx !== null) {
            formik.setFieldValue(`lineItems.${activeRowIdx}.itemId`, item.id);
            formik.setFieldValue(`lineItems.${activeRowIdx}.name`, item.name);
            formik.setFieldValue(
              `lineItems.${activeRowIdx}.description`,
              item.description ?? "",
            );
            formik.setFieldValue(
              `lineItems.${activeRowIdx}.rate`,
              String(item.unitPrice),
            );
            formik.setFieldValue(
              `lineItems.${activeRowIdx}.unit`,
              item.unit ?? "",
            );
          }
          setAddItemOpen(false);
          setActiveRowIdx(null);
        }}
      />
    </Box>
  );
}
