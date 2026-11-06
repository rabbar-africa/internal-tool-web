"use client";
import { Portal, Text, Tooltip, type TextProps } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";

interface TruncatedTextProps extends TextProps {
  children: string;
  lines?: number;
  /** Show the tooltip even when the text fits. */
  showTooltip?: boolean;
}

export function TruncatedText({
  children,
  lines = 2,
  showTooltip = false,
  ...props
}: TruncatedTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    // Taller than the clamp, or one word too wide to wrap.
    const checkTruncation = () => {
      setIsTruncated(
        element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth,
      );
    };

    checkTruncation();

    // The element itself, not the window: a table column can change width
    // when its rows load, with no window resize.
    const observer = new ResizeObserver(checkTruncation);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children, lines]);

  const truncatedText = (
    <Text
      ref={textRef}
      css={{
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        wordBreak: "break-word",
      }}
      {...props}
    >
      {children}
    </Text>
  );

  // Always mounted and switched off with `disabled`: swapping the tooltip in
  // and out would remount the text, leaving the observer on a dead node.
  // Portalled, so a scrolling container such as a table can't clip it.
  return (
    <Tooltip.Root disabled={!showTooltip && !isTruncated}>
      <Tooltip.Trigger asChild>{truncatedText}</Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content p=".75rem" maxW="20rem">
            {children}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
