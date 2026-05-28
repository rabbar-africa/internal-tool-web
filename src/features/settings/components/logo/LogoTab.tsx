import { useRef, useState } from "react";
import { Box, Button, Flex, Image, Stack, Text } from "@chakra-ui/react";
import { SectionTitle } from "../SectionTitle";
import {
  useGetOrganizationDetails,
  useUploadOrganizationLogo,
} from "../../api";

export function LogoTab() {
  const { data: organizationData } = useGetOrganizationDetails();
  const logoUrl = organizationData?.data?.logoUrl;
  const { mutate: uploadLogo, isPending } = useUploadOrganizationLogo();

  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadLogo(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        setPreview(null);
      },
    });
  };

  const handleDiscard = () => {
    setSelectedFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = preview ?? logoUrl;

  return (
    <Stack gap="6" pt="4">
      <SectionTitle
        title="Company Logo"
        subtitle="Upload your business logo — shown on invoices and documents"
      />

      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "flex-start", sm: "center" }}
        gap="6"
      >
        <Box
          w="120px"
          h="120px"
          rounded="lg"
          borderWidth="1px"
          borderColor="gray.100"
          bg="gray.50"
          overflow="hidden"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Company logo"
              w="full"
              h="full"
              objectFit="contain"
            />
          ) : (
            <Text fontSize="12px" color="gray.300" textAlign="center" px="2">
              No logo uploaded
            </Text>
          )}
        </Box>

        <Stack gap="3" flex="1">
          <Stack gap="1">
            <Text fontSize="13px" fontWeight="500" color="gray.500">
              Accepted formats: PNG, JPG, SVG, WEBP
            </Text>
            <Text fontSize="12px" color="gray.300">
              Max file size: 2MB. Recommended size: 400×400px or larger.
            </Text>
          </Stack>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Flex gap="2" wrap="wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
            >
              {displayUrl ? "Change Logo" : "Upload Logo"}
            </Button>

            {selectedFile && (
              <>
                <Button size="sm" onClick={handleUpload} loading={isPending}>
                  Save Logo
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  color="red.500"
                  onClick={handleDiscard}
                  disabled={isPending}
                >
                  Discard
                </Button>
              </>
            )}
          </Flex>

          {selectedFile && (
            <Text fontSize="12px" color="gray.300">
              Selected: {selectedFile.name}
            </Text>
          )}
        </Stack>
      </Flex>
    </Stack>
  );
}
