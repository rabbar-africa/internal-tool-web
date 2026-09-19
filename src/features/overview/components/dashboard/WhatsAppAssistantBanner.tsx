import { useState } from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { WhatsAppIcon } from "@/assets/custom/WhatsAppIcon";
import { XIcon } from "@/assets/custom/XIcon";
import { WhatsAppAssistantButton } from "@/components/common/WhatsAppAssistantButton";
import { useGetCurrentUserQuery } from "@/features/auth/api";
import {
  WHATSAPP_BOT_LINK,
  formatPhoneDisplay,
} from "@/shared/constants/whatsapp";
import storage from "@/utils/storage";

const DISMISSED_KEY = "whatsapp_banner_dismissed";

/**
 * Introduces the WhatsApp assistant on the dashboard until the user has
 * messaged it once (`hasMessagedWhatsappBot`, from /auth/me). Dismissing it
 * remembers the user's id, so it stays hidden for them on this device.
 */
export function WhatsAppAssistantBanner() {
  const { data: user } = useGetCurrentUserQuery();
  const [justDismissed, setJustDismissed] = useState(false);

  // Only show once the API has confirmed they haven't messaged the bot —
  // `undefined` means we can't tell, so stay quiet rather than nag.
  if (
    !WHATSAPP_BOT_LINK ||
    !user ||
    user.hasMessagedWhatsappBot !== false ||
    justDismissed
  ) {
    return null;
  }
  if (storage.getValue<string>(DISMISSED_KEY) === user.id) return null;

  const dismiss = () => {
    try {
      storage.setValue(DISMISSED_KEY, user.id);
    } catch {
      // Storage can be unavailable (private mode) — hide for this visit only.
    }
    setJustDismissed(true);
  };

  const phone = formatPhoneDisplay(user.phoneNumber);

  return (
    <Box
      as="section"
      aria-label="WhatsApp assistant"
      position="relative"
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="xl"
      p={{ base: "4", md: "5" }}
    >
      {/* Stacked: icon beside one column of title, text, then the button. */}
      <Flex gap="3.5" align="flex-start">
        <Flex
          flexShrink={0}
          w="2.5rem"
          h="2.5rem"
          rounded="full"
          bg="#E7F6F3"
          color="#128C7E"
          align="center"
          justify="center"
        >
          <WhatsAppIcon boxSize="1.25rem" aria-hidden="true" />
        </Flex>

        <Box flex="1" minW={0}>
          {/* Right padding keeps the copy clear of the dismiss button. */}
          <Box pr={{ base: "8", md: "10" }}>
            <Text fontSize="0.9375rem" fontWeight="600" color="gray.500">
              Run your workshop from WhatsApp
            </Text>
            <Text
              fontSize="0.8125rem"
              color="gray.400"
              mt="1"
              lineHeight="1.55"
              maxW="36rem"
            >
              Your Rabbar assistant can raise invoices, record payments and find
              customers.{" "}
              {phone
                ? `Message it from ${phone}, the number on your account.`
                : "Message it from the phone number on your account."}
            </Text>
          </Box>

          <WhatsAppAssistantButton
            mt="4"
            w={{ base: "full", sm: "auto" }}
            px="5"
            whiteSpace="nowrap"
          >
            {/* The full label doesn't fit a phone, so say less there. */}
            <Text as="span" display={{ base: "inline", md: "none" }}>
              Chat on WhatsApp
            </Text>
            <Text as="span" display={{ base: "none", md: "inline" }}>
              Chat with your Rabbar assistant on WhatsApp
            </Text>
          </WhatsAppAssistantButton>
        </Box>
      </Flex>

      <IconButton
        aria-label="Dismiss"
        variant="ghost"
        size="sm"
        position="absolute"
        top="2"
        right="2"
        minW="2rem"
        h="2rem"
        p="0"
        color="gray.300"
        _hover={{ color: "gray.500", bg: "gray.50" }}
        onClick={dismiss}
      >
        <XIcon boxSize="1rem" />
      </IconButton>
    </Box>
  );
}
