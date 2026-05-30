import { useCallback, useState } from "react";

interface UseClipboardOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<any>;
  paste: () => Promise<string | null>;
  isCopied: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useClipboard(
  options: UseClipboardOptions = {},
): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options;
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        setIsLoading(true);
        setError(null);

        if (navigator?.clipboard?.writeText) {
          // Modern API
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.select();
          const success = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (!success) {
            throw new Error("Failed to copy text to clipboard");
          }
        }

        setIsCopied(true);
        onSuccess?.();

        // Reset the isCopied state after timeout
        const timer = setTimeout(() => setIsCopied(false), timeout);
        return () => clearTimeout(timer);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [timeout, onSuccess, onError],
  );

  const paste = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        return text;
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  return {
    copy,
    paste,
    isCopied,
    isLoading,
    error,
  };
}
