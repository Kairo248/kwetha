import QRCode from "qrcode";

/**
 * Encode the unique ticket reference only so any QR reader returns text that validates directly.
 * Legacy emails may still show JSON payloads; `normalizeTicketScanInput` accepts those at the door.
 */
export async function generateTicketQrDataUrl(ticketReference: string) {
  return QRCode.toDataURL(ticketReference, {
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}