import { describe, expect, it } from "vitest";
import { verifyPaystackSignature } from "@/lib/payments/paystack";
import { generatePaymentReference } from "@/lib/payments/payment-flow";

describe("payment flow helpers", () => {
  it("generates a namespaced payment reference", () => {
    const reference = generatePaymentReference(new Date("2026-03-25T12:00:00Z"));

    expect(reference).toMatch(/^IKW-2026-[A-F0-9]{8}$/);
  });

  it("rejects invalid paystack signatures", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "IKW-2026-ABCD1234" } });

    expect(verifyPaystackSignature(body, "invalid-signature")).toBe(false);
  });
});