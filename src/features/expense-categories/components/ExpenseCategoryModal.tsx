import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomInput, CustomTextArea } from "@/components/input";
import type { IExpenseCategory } from "@/shared/interface/expense-category";
import {
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
} from "../api";
import { categoryConflictOf } from "../utils/conflict";

interface ExpenseCategoryModalProps {
  open: boolean;
  onClose: () => void;
  /** The category to rename; omit to add one. */
  category?: IExpenseCategory | null;
  /** Called with the category saved (or shown again), e.g. to select it. */
  onSaved?: (category: IExpenseCategory) => void;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Give it a name")
    .max(60, "Keep it to 60 characters"),
  description: Yup.string().max(200, "Keep it to 200 characters"),
});

/** Add a category, or rename one (a default too). */
export function ExpenseCategoryModal({
  open,
  onClose,
  category,
  onSaved,
}: ExpenseCategoryModalProps) {
  const isEdit = Boolean(category);
  const { mutate: create, isPending: isCreating } =
    useCreateExpenseCategoryMutation();
  const { mutate: update, isPending: isUpdating } =
    useUpdateExpenseCategoryMutation();
  // A hidden category already has this name: offer it back instead.
  const [hiddenMatch, setHiddenMatch] = useState<string | null>(null);
  const [nameTaken, setNameTaken] = useState<string | null>(null);

  const done = (saved: IExpenseCategory) => {
    onSaved?.(saved);
    onClose();
  };

  const onError = (error: unknown) => {
    const conflict = categoryConflictOf(error);
    if (conflict?.code !== "CATEGORY_EXISTS") return;
    if (conflict.hidden && conflict.categoryId) {
      setHiddenMatch(conflict.categoryId);
    } else {
      setNameTaken("You already have a category with this name");
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
    onSubmit: (values) => {
      setHiddenMatch(null);
      setNameTaken(null);
      const name = values.name.trim();
      const description = values.description.trim();
      if (category) {
        update(
          {
            id: category.id,
            payload: {
              ...(name !== category.name ? { name } : {}),
              description: description || null,
            },
          },
          { onSuccess: (res) => done(res.data), onError },
        );
      } else {
        create(
          { name, ...(description ? { description } : {}) },
          { onSuccess: (res) => done(res.data), onError },
        );
      }
    },
  });

  const showAgain = () => {
    if (!hiddenMatch) return;
    update(
      { id: hiddenMatch, payload: { isActive: true } },
      { onSuccess: (res) => done(res.data) },
    );
  };

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      setHiddenMatch(null);
      setNameTaken(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const renamedFrom =
    category?.isDefault &&
    category.defaultName &&
    category.defaultName !== category.name
      ? category.defaultName
      : null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="28rem" maxW="full" borderRadius="2xl" pt="2.5rem">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body>
              <form
                onSubmit={(event) => {
                  // The modal can open over another form (the expense form):
                  // its submit must not reach that one.
                  event.stopPropagation();
                  formik.handleSubmit(event);
                }}
              >
                <Stack gap="5">
                  <Box>
                    <Text fontSize="16px" fontWeight="600" color="gray.500">
                      {isEdit ? "Rename category" : "New category"}
                    </Text>
                    {renamedFrom && (
                      <Text fontSize="13px" color="gray.300" mt="1">
                        First called {renamedFrom}
                      </Text>
                    )}
                  </Box>
                  <CustomInput
                    label="Name"
                    placeholder="e.g. Fuel"
                    required
                    name="name"
                    inputProps={{ maxLength: 60 }}
                    value={formik.values.name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setHiddenMatch(null);
                      setNameTaken(null);
                      formik.handleChange(event);
                    }}
                    error={
                      nameTaken ??
                      (formik.touched.name ? formik.errors.name : undefined)
                    }
                  />
                  <CustomTextArea
                    label="Description (optional)"
                    placeholder="What goes in it"
                    name="description"
                    rows={2}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.description
                        ? formik.errors.description
                        : undefined
                    }
                  />
                  {hiddenMatch && (
                    <Flex
                      align="center"
                      justify="space-between"
                      gap="3"
                      p="3"
                      bg="warning.50"
                      rounded="lg"
                    >
                      <Text fontSize="13px" color="gray.500">
                        You already have this category, but it's hidden.
                      </Text>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        flexShrink={0}
                        loading={isUpdating}
                        onClick={showAgain}
                      >
                        Show it again
                      </Button>
                    </Flex>
                  )}
                  <Flex gap="3" justify="flex-end" pt="2">
                    <Button variant="outline" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={isCreating || isUpdating}>
                      {isEdit ? "Save" : "Add category"}
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
