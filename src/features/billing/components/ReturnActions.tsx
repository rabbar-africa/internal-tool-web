import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { WHATSAPP_BOT_LINK } from "@/shared/constants/whatsapp";

interface ReturnActionsProps {
  /**
   * The payer works in the WhatsApp bot: true, false, or undefined when the
   * page could not tell (an error before anything loaded).
   */
  onWhatsapp?: boolean;
  /** Where the web button goes, and what it says. */
  to: string;
  label: string;
}

/**
 * Where to go from the public billing pages. Most people paying from a link
 * work in the WhatsApp bot and have never logged in to the web app, so for
 * them the way back to the chat comes first (it opens with "Menu" typed:
 * one tap on Send brings the menu up). When the page can't tell, both are
 * offered, the web one first; when they are known not to use the bot, or the
 * bot's number isn't configured, only the web one.
 */
export function ReturnActions({ onWhatsapp, to, label }: ReturnActionsProps) {
  const chat = onWhatsapp === false ? null : WHATSAPP_BOT_LINK;
  const chatFirst = Boolean(chat && onWhatsapp);

  const web = (
    <Button asChild variant={chatFirst ? "outline" : "accent"} w="full">
      <Link to={to}>{label}</Link>
    </Button>
  );
  if (!chat) return web;

  const whatsapp = (
    <Button asChild variant={chatFirst ? "accent" : "outline"} w="full">
      <a href={chat}>Back to WhatsApp</a>
    </Button>
  );
  return chatFirst ? (
    <>
      {whatsapp}
      {web}
    </>
  ) : (
    <>
      {web}
      {whatsapp}
    </>
  );
}
