/**
 * QR payloads may be plain ticket references (preferred) or legacy JSON from older QR images.
 * Bouncers paste whatever the scanner outputs into validation — normalize before DB lookup.
 */
export function normalizeTicketScanInput(raw: string): string {
  const trimmed = raw.trim().replace(/^["']|["']$/g, "").trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as { ticketReference?: unknown };
      if (typeof parsed.ticketReference === "string" && parsed.ticketReference.trim().length > 0) {
        return parsed.ticketReference.trim();
      }
    } catch {
      /* fall through — treat as opaque string */
    }
  }

  return trimmed;
}
