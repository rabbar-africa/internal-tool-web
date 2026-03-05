import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Input,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";

export interface InvoiceNumberConfig {
  mode: "auto" | "manual";
  prefix: string;
  nextNumber: string;
}

interface InvoiceNumberConfigModalProps {
  open: boolean;
  onClose: () => void;
  config: InvoiceNumberConfig;
  onSave: (config: InvoiceNumberConfig) => void;
}

export function InvoiceNumberConfigModal({
  open,
  onClose,
  config,
  onSave,
}: InvoiceNumberConfigModalProps) {
  const [local, setLocal] = useState<InvoiceNumberConfig>(config);

  useEffect(() => {
    if (open) setLocal(config);
  }, [config, open]);

  const handleSave = () => {
    onSave(local);
    onClose();
  };

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
          <Dialog.Content maxW="440px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Configure Invoice Number Preferences
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body py="5">
              <Stack gap="4">
                <Text fontSize="13px" color="gray.400" lineHeight="1.6">
                  Your invoice numbers are set on auto-generate mode to save
                  your time. Are you sure about changing this setting?
                </Text>

                <Stack gap="3">
                  {/* Auto mode */}
                  <Box
                    borderWidth="1px"
                    borderColor={
                      local.mode === "auto" ? "primary.300" : "gray.100"
                    }
                    rounded="md"
                    p="3"
                    cursor="pointer"
                    bg={local.mode === "auto" ? "primary.50" : "white"}
                    onClick={() => setLocal((c) => ({ ...c, mode: "auto" }))}
                  >
                    <Flex align="center" gap="2.5">
                      <Box
                        w="16px"
                        h="16px"
                        rounded="full"
                        borderWidth="2px"
                        borderColor={
                          local.mode === "auto" ? "primary.300" : "gray.200"
                        }
                        bg={local.mode === "auto" ? "primary.300" : "white"}
                        flexShrink={0}
                        transition="all 0.15s"
                      />
                      <Text fontSize="13px" fontWeight="500" color="gray.500">
                        Continue auto-generating invoice numbers
                      </Text>
                    </Flex>

                    {local.mode === "auto" && (
                      <Grid templateColumns="1fr 1fr" gap="3" mt="3">
                        <Box>
                          <Text
                            fontSize="11px"
                            fontWeight="600"
                            color="gray.300"
                            mb="1"
                            textTransform="uppercase"
                          >
                            Prefix
                          </Text>
                          <Input
                            value={local.prefix}
                            onChange={(e) =>
                              setLocal((c) => ({
                                ...c,
                                prefix: e.target.value,
                              }))
                            }
                            h="2.5rem"
                            px="3"
                            fontSize="13px"
                            borderColor="gray.100"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Box>
                        <Box>
                          <Text
                            fontSize="11px"
                            fontWeight="600"
                            color="gray.300"
                            mb="1"
                            textTransform="uppercase"
                          >
                            Next Number
                          </Text>
                          <Input
                            value={local.nextNumber}
                            onChange={(e) =>
                              setLocal((c) => ({
                                ...c,
                                nextNumber: e.target.value,
                              }))
                            }
                            h="2.5rem"
                            px="3"
                            fontSize="13px"
                            borderColor="gray.100"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Box>
                      </Grid>
                    )}
                  </Box>

                  {/* Manual mode */}
                  <Box
                    borderWidth="1px"
                    borderColor={
                      local.mode === "manual" ? "primary.300" : "gray.100"
                    }
                    rounded="md"
                    p="3"
                    cursor="pointer"
                    bg={local.mode === "manual" ? "primary.50" : "white"}
                    onClick={() => setLocal((c) => ({ ...c, mode: "manual" }))}
                  >
                    <Flex align="center" gap="2.5">
                      <Box
                        w="16px"
                        h="16px"
                        rounded="full"
                        borderWidth="2px"
                        borderColor={
                          local.mode === "manual" ? "primary.300" : "gray.200"
                        }
                        bg={local.mode === "manual" ? "primary.300" : "white"}
                        flexShrink={0}
                        transition="all 0.15s"
                      />
                      <Text fontSize="13px" fontWeight="500" color="gray.500">
                        Enter invoice numbers manually
                      </Text>
                    </Flex>
                  </Box>
                </Stack>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
              <Flex gap="3" justify="flex-end">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
