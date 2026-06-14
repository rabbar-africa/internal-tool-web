import { createElement, useCallback, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createDownloadLink } from "@/utils/file-helper";
import type { IPaymentReceived } from "@/shared/interface/payment";

/**
 * Client-side payment-receipt PDF generation via @react-pdf/renderer.
 * Mirrors the on-screen <PaymentReceipt/>. The heavy renderer + document are
 * lazy-loaded so the bundle is only fetched when a download is triggered.
 */
export function useReceiptPdf() {
  const { userOrganization } = useCurrentUser();
  const [isGenerating, setIsGenerating] = useState(false);

  const getBlob = useCallback(
    async (payment: IPaymentReceived): Promise<Blob> => {
      setIsGenerating(true);
      try {
        const [{ pdf }, { PaymentReceiptDocument }] = await Promise.all([
          import("@react-pdf/renderer"),
          import("../components/payment-detail/pdf/PaymentReceiptDocument"),
        ]);
        // The document renders a <Document>, but its prop type doesn't
        // structurally match react-pdf's DocumentProps — cast to pdf()'s arg.
        const element = createElement(PaymentReceiptDocument, {
          payment,
          organization: userOrganization,
        }) as unknown as Parameters<typeof pdf>[0];
        return await pdf(element).toBlob();
      } finally {
        setIsGenerating(false);
      }
    },
    [userOrganization],
  );

  /** Generate and trigger a browser download. */
  const download = useCallback(
    async (payment: IPaymentReceived): Promise<void> => {
      const blob = await getBlob(payment);
      const fileName = `${
        payment.paymentNumber || `payment-${payment.id}`
      }.pdf`;
      createDownloadLink(blob, fileName);
    },
    [getBlob],
  );

  return { download, getBlob, isGenerating };
}
