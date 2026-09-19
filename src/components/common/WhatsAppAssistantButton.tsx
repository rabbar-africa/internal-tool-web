import { Button, type ButtonProps } from "@chakra-ui/react";
import { WhatsAppIcon } from "@/assets/custom/WhatsAppIcon";
import { WHATSAPP_BOT_LINK } from "@/shared/constants/whatsapp";

/**
 * Opens a chat with the Rabbar WhatsApp assistant. WhatsApp's dark green keeps
 * it instantly recognisable while holding readable contrast with white text.
 */
export function WhatsAppAssistantButton({
  children = "Chat with your Rabbar assistant on WhatsApp",
  ...props
}: ButtonProps) {
  if (!WHATSAPP_BOT_LINK) return null;

  return (
    <Button
      asChild
      bg="#128C7E"
      color="white"
      fontWeight="600"
      gap="2.5"
      h="auto"
      minH="3rem"
      py="3"
      whiteSpace="normal"
      textAlign="center"
      _hover={{ bg: "#0E7468" }}
      _active={{ bg: "#0E7468", transform: "scale(0.98)" }}
      {...props}
    >
      <a href={WHATSAPP_BOT_LINK} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon boxSize="1.25rem" flexShrink={0} aria-hidden="true" />
        {children}
      </a>
    </Button>
  );
}
