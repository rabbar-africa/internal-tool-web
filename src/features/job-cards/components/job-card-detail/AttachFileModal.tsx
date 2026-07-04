import { useState } from "react";
import { Button, Dialog, Flex, Portal, Stack } from "@chakra-ui/react";
import { CustomFileInput } from "@/components/common/CustomFileInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { uploadFile } from "@/features/paperwork/api/service";
import { useAttachJobCardFileMutation } from "../../api/query";

interface AttachFileModalProps {
  open: boolean;
  onClose: () => void;
  jobCardId: string;
}

const CATEGORY_OPTIONS = [
  { label: "Photo", value: "PHOTO" },
  { label: "Signed Approval", value: "APPROVAL" },
  { label: "Document", value: "DOCUMENT" },
  { label: "Other", value: "OTHER" },
];

export function AttachFileModal({
  open,
  onClose,
  jobCardId,
}: AttachFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: attachFile, isPending } = useAttachJobCardFileMutation();

  const handleClose = () => {
    setFile(null);
    setCategory("");
    setNotes("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadFile(file, "job-cards");
      await attachFile({
        jobCardId,
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        fileType: uploaded.fileType,
        fileSize: uploaded.fileSize,
        category: category || undefined,
        notes: notes || undefined,
      });
      handleClose();
    } finally {
      setIsUploading(false);
    }
  };

  const isBusy = isUploading || isPending;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) handleClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="440px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Attach File
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body py="5">
              <Stack gap="4">
                <CustomFileInput
                  label="File"
                  required
                  helperText="Images or PDFs, up to 10MB"
                  inputProps={{
                    accept: "image/*,application/pdf",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                      setFile(e.target.files?.[0] ?? null),
                  }}
                />
                <CustomSelect
                  label="Category"
                  placeholder="Select category..."
                  options={CATEGORY_OPTIONS}
                  value={category ? [category] : undefined}
                  onChange={(opt: { value: string[] }) =>
                    setCategory(opt?.value?.[0] ?? "")
                  }
                />
                <CustomTextArea
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional note about this file"
                  rows={2}
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
              <Flex gap="3" justify="flex-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!file}
                  loading={isBusy}
                  loadingText={isUploading ? "Uploading..." : "Attaching..."}
                >
                  Attach File
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
