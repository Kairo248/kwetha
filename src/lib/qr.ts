import QRCode from "qrcode";

export async function generateTicketQrDataUrl(
  ticketId: string,
  ticketReference: string,
  eventId: string,
) {
  return QRCode.toDataURL(
    JSON.stringify({
      ticketId,
      ticketReference,
      eventId,
      issuedAt: new Date().toISOString(),
    }),
    {
      width: 360,
      margin: 1,
    },
  );
}