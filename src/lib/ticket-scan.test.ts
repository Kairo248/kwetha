import { describe, expect, it } from "vitest";
import { normalizeTicketScanInput } from "@/lib/ticket-scan";

describe("normalizeTicketScanInput", () => {
  it("returns plain references", () => {
    expect(normalizeTicketScanInput("  IKW-2026-0042  ")).toBe("IKW-2026-0042");
  });

  it("extracts ticketReference from legacy JSON QR payloads", () => {
    const json = JSON.stringify({
      ticketId: "uuid",
      ticketReference: "IKW-2026-0001",
      eventId: "evt",
      issuedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(normalizeTicketScanInput(json)).toBe("IKW-2026-0001");
  });

  it("strips wrapping quotes", () => {
    expect(normalizeTicketScanInput('"IKW-2026-0001"')).toBe("IKW-2026-0001");
  });
});
